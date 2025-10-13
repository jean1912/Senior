// src/visualizations/visualization-seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visualization } from './visualization.entity';
import { VisualizationSeeder } from './visualization.seeder'; // or .seed if you renamed
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visualization, Algorithm, Users])],
  providers: [VisualizationSeeder],
  exports: [VisualizationSeeder],
})
export class VisualizationSeederModule {}
