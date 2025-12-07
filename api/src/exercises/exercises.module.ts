// src/exercises/exercises.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { Users } from '../user/users.entity';
import { Algorithm } from '../algorithms/algorithm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, Users, Algorithm])],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
