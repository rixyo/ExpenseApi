import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
//4.56

interface SignupParams {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async signup({ email, password, name, phone }: SignupParams) {
    const ExistingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (ExistingUser) {
      throw new ConflictException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { id: uuid(), email, password: hashedPassword, name, phone },
    });
    return user;
  }
}
