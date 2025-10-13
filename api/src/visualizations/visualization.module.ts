import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visualization } from './visualization.entity';
import { VisualizationService } from './visualization.service';
import { VisualizationController } from './visualization.controller';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visualization, Algorithm, Users])],
  controllers: [VisualizationController],
  providers: [VisualizationService],
  exports: [VisualizationService],
})
export class VisualizationModule {}
