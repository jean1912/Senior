import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Algorithm } from './algorithm.entity';
import { CreateAlgorithmDto } from './dto/create-algorithm.dto';
import { UpdateAlgorithmDto } from './dto/update-algorithm.dto';
import { Users } from '../user/users.entity';

@Injectable()
export class AlgorithmsService {
  constructor(
    @InjectRepository(Algorithm)
    private readonly algorithmsRepository: Repository<Algorithm>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  // 🧩 Create algorithm and link to logged-in user
  async create(dto: CreateAlgorithmDto, user?: any): Promise<Algorithm> {
    const existing = await this.algorithmsRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Algorithm already exists');

    let fullUser: Users | undefined = undefined;
    if (user?.userId) {
      fullUser = await this.usersRepository.findOne({ where: { id: user.userId } }) || undefined;
    }

    const algorithm = this.algorithmsRepository.create({
      ...dto,
      createdBy: fullUser, // ✅ use undefined instead of null
    });

    return await this.algorithmsRepository.save(algorithm);
  }

  // 🧩 Get all algorithms (with creator info)
  async findAll(): Promise<Algorithm[]> {
    return this.algorithmsRepository.find({
      relations: ['createdBy', 'lastEditedBy'],
      order: { created_at: 'DESC' },
    });
  }

  // 🧩 Get one by ID
  async findOne(id: number): Promise<Algorithm> {
    const algo = await this.algorithmsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'lastEditedBy'],
    });
    if (!algo) throw new NotFoundException(`Algorithm with ID ${id} not found`);
    return algo;
  }

  // 🧩 Update
  async update(id: number, dto: UpdateAlgorithmDto, user?: any): Promise<Algorithm> {
    const algo = await this.findOne(id);

    if (dto.name && dto.name !== algo.name) {
      const nameTaken = await this.algorithmsRepository.findOne({ where: { name: dto.name } });
      if (nameTaken) throw new BadRequestException('Another algorithm with this name exists');
    }

    let fullUser: Users | undefined = undefined;
    if (user?.userId) {
      fullUser = await this.usersRepository.findOne({ where: { id: user.userId } }) || undefined;
    }

    Object.assign(algo, dto);
    algo.lastEditedBy = fullUser;
    return this.algorithmsRepository.save(algo);
  }

  // 🧩 Delete
  async remove(id: number): Promise<void> {
    const result = await this.algorithmsRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Algorithm with ID ${id} not found`);
  }
}
