import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visualization } from './visualization.entity';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';

@Injectable()
export class VisualizationService {
  constructor(
    @InjectRepository(Visualization)
    private readonly visRepo: Repository<Visualization>,
    @InjectRepository(Algorithm)
    private readonly algoRepo: Repository<Algorithm>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  // 🧱 Create static visualization
  async create(dto: CreateVisualizationDto, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const algorithm = await this.algoRepo.findOne({
      where: { id: dto.algorithmId },
    });
    if (!algorithm) throw new BadRequestException('Algorithm not found');

    const vis = this.visRepo.create({
      ...dto,
      algorithm,
      user,
    });
    return this.visRepo.save(vis);
  }

  // 📋 Get all
  async findAll() {
  const visualizations = await this.visRepo.find({
    relations: ['algorithm', 'user'],
  });

  // ✅ If table is empty, generate temporary demo visualizations from algorithms
  if (visualizations.length === 0) {
    const algorithms = await this.algoRepo.find();
    if (algorithms.length === 0) {
      throw new BadRequestException('No algorithms available');
    }

    const samples = algorithms.map((algo) => ({
      id: algo.id * 1000, // fake id
      title: `${algo.name} Visualization`,
      description: `Dynamic ${algo.name} visualization demo.`,
      structureType: algo.category === 'Graph' ? 'Graph' : 'Array',
      algorithm: algo,
    }));

    return samples;
  }

  return visualizations;
}

  // 🔍 Get one
  async findOne(id: number) {
    const vis = await this.visRepo.findOne({
      where: { id },
      relations: ['algorithm', 'user'],
    });
    if (!vis) throw new BadRequestException('Visualization not found');
    return vis;
  }

  // ✏️ Update
  async update(id: number, dto: UpdateVisualizationDto) {
    const vis = await this.visRepo.findOne({ where: { id } });
    if (!vis) throw new BadRequestException('Visualization not found');
    Object.assign(vis, dto);
    return this.visRepo.save(vis);
  }

  // ❌ Delete
  async remove(id: number) {
    const vis = await this.visRepo.findOne({ where: { id } });
    if (!vis) throw new BadRequestException('Visualization not found');
    await this.visRepo.remove(vis);
    return { message: 'Visualization deleted successfully' };
  }

  // ⚙️ NEW — Dynamic visualization generation
  async generateDynamic(algorithmId: number, input: any) {
    const algo = await this.algoRepo.findOne({ where: { id: algorithmId } });
    if (!algo) throw new BadRequestException('Algorithm not found');

    const steps: any[] = [];

    try {
      // 🧠 Wrap algorithm code and return function
      const wrappedCode = `
        ${algo.code}
        return typeof bubbleSort === 'function' ? bubbleSort :
               typeof mergeSort === 'function' ? mergeSort :
               typeof binarySearch === 'function' ? binarySearch :
               typeof depthFirstSearch === 'function' ? depthFirstSearch :
               typeof dfs === 'function' ? dfs :
               null;
      `;

      const fn = new Function(wrappedCode)();

      if (typeof fn !== 'function') {
        throw new Error('Algorithm code did not return a valid function');
      }

      const result = fn(input, steps);

      return {
        algorithm: { id: algo.id, name: algo.name },
        stateJson: { steps, result },
      };
    } catch (err) {
      console.error('⚠️ Algorithm execution error:', err);
      throw new BadRequestException('Algorithm execution failed.');
    }
  }
}
