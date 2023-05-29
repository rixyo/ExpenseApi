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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserRole)) userType: UserRole,
  ) {
    if (userType !== UserRole.BUYER) {
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
  @Get('me')
  me(@User() user: userType) {
    return this.authService.getCurrentUser(user?.id);
  }
}
