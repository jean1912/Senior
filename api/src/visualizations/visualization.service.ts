import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visualization } from './visualization.entity';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';

@Injectable()
export class VisualizationService {
  constructor(
    @InjectRepository(Visualization)
    private visualizationRepository: Repository<Visualization>,
    @InjectRepository(Algorithm)
    private algorithmRepository: Repository<Algorithm>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(dto: CreateVisualizationDto, userId: number) {
    const algorithm = await this.algorithmRepository.findOneBy({ id: dto.algorithmId });
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!algorithm) throw new NotFoundException('Algorithm not found');
    if (!user) throw new NotFoundException('User not found');

    const visualization = this.visualizationRepository.create({
      ...dto,
      algorithm,
      user,
    });

    return this.visualizationRepository.save(visualization);
  }

  async findAll() {
    return this.visualizationRepository.find({
      relations: ['algorithm', 'user'],
    });
  }

  async findOne(id: number) {
    const vis = await this.visualizationRepository.findOne({
      where: { id },
      relations: ['algorithm', 'user'],
    });
    if (!vis) throw new NotFoundException('Visualization not found');
    return vis;
  }

  async update(id: number, dto: UpdateVisualizationDto) {
    const vis = await this.visualizationRepository.findOneBy({ id });
    if (!vis) throw new NotFoundException('Visualization not found');

    Object.assign(vis, dto);
    return this.visualizationRepository.save(vis);
  }

  async remove(id: number) {
    const vis = await this.visualizationRepository.findOneBy({ id });
    if (!vis) throw new NotFoundException('Visualization not found');
    await this.visualizationRepository.delete(id);
    return { message: 'Visualization deleted successfully' };
  }
}
