import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from './users.entity';
import { CreateUsersDto } from './dto/create-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(dto: CreateUsersDto): Promise<Omit<Users, 'password'>> {
    const existing = await this.usersRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });

    if (existing) {
      throw new BadRequestException('Username or email already exists');
    }

    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      isActive: true,
    });

    const saved = await this.usersRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async findAll(): Promise<Omit<Users, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: number): Promise<Omit<Users, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Optional helper (for AuthService)
  async findByUsername(username: string): Promise<Users | undefined> {
    const user = await this.usersRepository.findOne({ where: { username }, select: ['id', 'username', 'password', 'email'] });
    return user ?? undefined;
  }
}
