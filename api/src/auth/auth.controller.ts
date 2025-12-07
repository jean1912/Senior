import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { SignUpDto } from './dto/SignUpDto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../user/users.entity';
import { Repository } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: any }> {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  
  @Post('signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ access_token: string; user: any }> {
    return this.authService.signUp(signUpDto);
  }

  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersRepository.findOne({
      where: { id: req.user.userId },
      select: ['id', 'firstName', 'lastName', 'username', 'email', 'isActive', 'created_at'],
    });
    return user;
  }
}
