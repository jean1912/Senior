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
  ) {}

  async create(dto: CreateAlgorithmDto, user?: Users): Promise<Algorithm> {
    const existing = await this.algorithmsRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('Algorithm already exists');

    const algorithm = this.algorithmsRepository.create({
      ...dto,
      createdBy: user,
    });

    return this.algorithmsRepository.save(algorithm);
  }

  async findAll(): Promise<Algorithm[]> {
    return this.algorithmsRepository.find({
      relations: ['createdBy', 'lastEditedBy'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Algorithm> {
    const algo = await this.algorithmsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'lastEditedBy'],
    });
    if (!algo) throw new NotFoundException(`Algorithm with ID ${id} not found`);
    return algo;
  }

  async update(id: number, dto: UpdateAlgorithmDto, user?: Users): Promise<Algorithm> {
    const algo = await this.findOne(id);

    if (dto.name && dto.name !== algo.name) {
      const nameTaken = await this.algorithmsRepository.findOne({ where: { name: dto.name } });
      if (nameTaken) throw new BadRequestException('Another algorithm with this name exists');
    }

    Object.assign(algo, dto);
    algo.lastEditedBy = user;
    return this.algorithmsRepository.save(algo);
  }

  async remove(id: number): Promise<void> {
    const result = await this.algorithmsRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Algorithm with ID ${id} not found`);
  }
}
