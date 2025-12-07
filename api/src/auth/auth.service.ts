import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../user/users.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/SignUpDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'email',
        'firstName',
        'lastName',
        'isActive',
      ],
    });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token, user };
  }

  async signUp(signUpDto: SignUpDto) {
    const { firstName, lastName, username, email, password } = signUpDto;
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) throw new BadRequestException('Username or email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password: _, ...userWithoutPassword } = savedUser;

    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token, user: userWithoutPassword };
  }
}
