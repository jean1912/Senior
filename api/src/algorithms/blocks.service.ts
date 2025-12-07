import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlgorithmBlock } from './algorithm-block.entity';
import { Algorithm } from './algorithm.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(AlgorithmBlock) private readonly blockRepo: Repository<AlgorithmBlock>,
    @InjectRepository(Algorithm) private readonly algoRepo: Repository<Algorithm>,
  ) {}

  async create(dto: CreateBlockDto) {
    const algo = await this.algoRepo.findOne({ where: { id: dto.algorithmId } });
    if (!algo) throw new NotFoundException('Algorithm not found');

    const block = this.blockRepo.create({
      name: dto.name,
      parameters: dto.parameters,
      codeSnippet: dto.codeSnippet,
      order: dto.order ?? 0,
      algorithm: algo,
    });
    return this.blockRepo.save(block);
  }

  findByAlgorithm(algorithmId: number) {
    return this.blockRepo.find({
      where: { algorithm: { id: algorithmId } },
      order: { order: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateBlockDto) {
    const block = await this.blockRepo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    Object.assign(block, {
      name: dto.name ?? block.name,
      parameters: dto.parameters ?? block.parameters,
      codeSnippet: dto.codeSnippet ?? block.codeSnippet,
      order: dto.order ?? block.order,
    });
    return this.blockRepo.save(block);
  }

  async remove(id: number) {
    await this.blockRepo.delete(id);
    return { ok: true };
  }
}
