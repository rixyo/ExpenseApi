import {
  Controller,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GenerateProductDto, LoginDto, SignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { User, userType } from '../decorators/user.decorator';
import { Roles } from 'src/decorators/role.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserRole)) userType: UserRole,
  ) {
    if (userType !== UserRole.BUYER && userType !== UserRole.ADMIN) {
      if (!body.productKey) {
        throw new UnauthorizedException('product key is required');
      }
      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );
      if (!isValidProductKey) {
        throw new UnauthorizedException('invalid product key');
      }
    } else if (userType === UserRole.ADMIN) {
      const isValidProductKey =
        process.env.ADMIN_SECRET_KEY === body.productKey;
      const isValadAdminEmail = process.env.ADMIN_EMAIL === body.email;
      if (!isValidProductKey || !isValadAdminEmail) {
        throw new UnauthorizedException('invalid credentials');
      }
    }
    return this.authService.signup(body, userType);
  }
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
  @Roles(UserRole.ADMIN)
  @Post('product-key')
  genarateProductKey(@Body() body: GenerateProductDto) {
    return this.authService.genarateProductKey(body.email, body.userType);
  }
  @Roles(UserRole.BUYER, UserRole.REALTOR, UserRole.ADMIN)
  @Get('me')
  me(@User() user: userType) {
    return this.authService.getCurrentUser(user?.id);
  }
}
