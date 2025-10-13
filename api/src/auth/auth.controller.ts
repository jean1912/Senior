import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { SignUpDto } from './dto/SignUpDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
async login(@Body() loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
  return this.authService.login(loginDto.username, loginDto.password);
}

   @Post('signup')
async signUp(@Body() signUpDto: SignUpDto): Promise<{ access_token: string; user: any }> {
  return this.authService.signUp(signUpDto);
}

}