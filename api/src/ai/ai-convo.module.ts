// src/ai/ai-convo.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiConvoController } from './ai-convo.controller';
import { AiConvoService } from './ai-convo.service';

import { Algorithm } from '../algorithms/algorithm.entity';
import { Exercise } from '../exercises/exercise.entity';
import { Submission } from '../submissions/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Algorithm, Exercise, Submission])],
  controllers: [AiConvoController],
  providers: [AiConvoService],
  exports: [AiConvoService],
})
export class AiConvoModule {}
