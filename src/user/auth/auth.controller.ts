//user controller is a class that responsible for authenticating users
///9:15 PM 27/05/2023
import {
  Controller,
  Post,
  Body,
  Param,
  ParseEnumPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GenerateProductDto, LoginDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(Role)) userType: Role,
  ) {
    if (userType !== Role.BUYER) {
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
    }
    return this.authService.signup(body, userType);
  }
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
  @Post('product-key')
  genarateProductKey(@Body() body: GenerateProductDto) {
    return this.authService.genarateProductKey(body.email, body.userType);
  }
}
