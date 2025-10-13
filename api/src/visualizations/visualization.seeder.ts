import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Visualization } from './visualization.entity';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';

@Injectable()
export class VisualizationSeeder {
  private readonly logger = new Logger(VisualizationSeeder.name);

  constructor(
    @InjectRepository(Visualization)
    private visualizationRepository: Repository<Visualization>,
    @InjectRepository(Algorithm)
    private algorithmRepository: Repository<Algorithm>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async seed() {
    const count = await this.visualizationRepository.count();
    if (count > 0) {
      this.logger.log('✅ Visualizations already exist — skipping.');
      return;
    }

    const user = await this.usersRepository.findOne({ where: {} });
    const algorithms = await this.algorithmRepository.find();

    if (!user || algorithms.length === 0) {
      this.logger.warn('⚠️ Skipping visualization seed: Missing user or algorithms.');
      return;
    }

    const getAlgorithm = (name: string) =>
      algorithms.find((a) => a.name.toLowerCase().includes(name.toLowerCase()));

    const samples: Partial<Visualization>[] = [
      {
        title: 'Bubble Sort Demo',
        description: 'Step-by-step visualization of Bubble Sort swaps.',
        structureType: 'Array',
        stateJson: {
          initial: [5, 3, 8, 2],
          steps: [
            [3, 5, 8, 2],
            [3, 5, 2, 8],
            [3, 2, 5, 8],
            [2, 3, 5, 8],
          ],
        },
        stepCount: 4,
        algorithm: getAlgorithm('Bubble Sort'),
        user,
      },
      {
        title: 'Binary Search Example',
        description: 'Shows binary search narrowing down the target index.',
        structureType: 'Array',
        stateJson: {
          arr: [1, 3, 5, 7, 9],
          target: 7,
          steps: [
            { low: 0, high: 4, mid: 2 },
            { low: 3, high: 4, mid: 3 },
          ],
        },
        stepCount: 2,
        algorithm: getAlgorithm('Binary Search'),
        user,
      },
      {
        title: 'DFS Exploration Graph',
        description: 'Traversal of nodes using Depth-First Search.',
        structureType: 'Graph',
        stateJson: {
          nodes: ['A', 'B', 'C', 'D'],
          edges: [['A', 'B'], ['A', 'C'], ['B', 'D']],
          visitedOrder: ['A', 'B', 'D', 'C'],
        },
        stepCount: 4,
        algorithm: getAlgorithm('DFS'),
        user,
      },
    ];

    await this.visualizationRepository.save(samples);
    this.logger.log('🌱 Seeded visualizations for existing algorithms successfully.');
  }
}
