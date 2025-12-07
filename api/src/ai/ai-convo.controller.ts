// src/ai/ai-convo.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  AlgoQuestionDto,
  CodeReviewDto,
  ExerciseQuestionDto,
  SubmissionReviewDto,
} from './dto/ai-convo.dto';

import { AiConvoService } from './ai-convo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiConvoController {
  constructor(private service: AiConvoService) {}

  @Post('explain-algorithm')
  async explainAlgorithm(@Body() dto: AlgoQuestionDto) {
    return { explanation: await this.service.explainAlgorithm(dto) };
  }

  @Post('generate-hints')
  @UseGuards(JwtAuthGuard)
  async generateHints(@Body() dto: ExerciseQuestionDto) {
    return { hints: await this.service.generateExerciseHints(dto) };
  }

  @Post('review-code')
  @UseGuards(JwtAuthGuard)
  async reviewCode(@Body() dto: CodeReviewDto) {
    return { review: await this.service.reviewCode(dto) };
  }

  @Post('review-submission')
  @UseGuards(JwtAuthGuard)
  async reviewSubmission(@Body() dto: SubmissionReviewDto) {
    return { review: await this.service.reviewSubmission(dto) };
  }
}
