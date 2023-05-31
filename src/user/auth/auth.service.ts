import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UserResponseDto } from './dto/auth.dto';
interface SignupParams {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  productKey?: string;
}
interface LoginParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async signup(
    { email, password, name, phone }: SignupParams,
    userType: UserRole,
  ) {
    const ExistingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (ExistingUser) {
      throw new ConflictException('invalid credentails');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        id: uuid(),
        email,
        password: hashedPassword,
        name,
        phone,
        role: userType,
      },
    });

    return this.generateToken(user.id, user.name, user.role);
  }
  async login({ email, password }: LoginParams) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('Invalid credentails', 400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentails', 400);
    }
    return this.generateToken(user.id, user.name, user.role);
  }
  private generateToken(id: string, name: string, role: UserRole) {
    return jwt.sign({ name, id, role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }
  genarateProductKey(email: string, userType: UserRole) {
    const token = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(token, 10);
  }
  async getCurrentUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    if (!user) throw new HttpException('User not found', 404);
    return new UserResponseDto(user);
  }
}
