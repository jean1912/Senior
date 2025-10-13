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

  /**
   * Validate a user during login.
   * Returns the user (without password) if credentials match.
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<Users, 'password'> | null> {
    // 🧩 Select only necessary fields for validation
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

    // 🧩 Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // 🧩 Remove password before returning
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Handle user login
   * Returns JWT + sanitized user data
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; user: Omit<Users, 'password'> }> {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }

  /**
   * Handle new user registration (signup)
   * Returns JWT + sanitized user data
   */
  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ access_token: string; user: Omit<Users, 'password'> }> {
    const { firstName, lastName, username, email, password } = signUpDto;

    // 🧩 Check for existing user with same username or email
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    // 🧩 Hash password before saving
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

    // 🧩 Generate JWT token
    const payload = { sub: savedUser.id, username: savedUser.username };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: userWithoutPassword };
  }
}
