//user controller is a class that responsible for authenticating users
///9:15 PM 27/05/2023
import { Controller, Post, Body } from '@nestjs/common';
import { SignupDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }
}
