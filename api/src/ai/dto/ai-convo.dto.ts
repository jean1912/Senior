// src/ai/dto/ai-convo.dto.ts

import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Length,
} from 'class-validator';

export class CreateAiConvoDto {
  @IsOptional()
  @Length(1, 250)
  question?: string;
}

export class AlgoQuestionDto extends CreateAiConvoDto {
  
  @IsNumber()
  
  algorithmId: number;
}

export class ExerciseQuestionDto extends CreateAiConvoDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  exerciseId: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  algorithmIds?: number[];

  @IsOptional()
  @Length(0, 500)
  context?: string;
}

export class CodeReviewDto extends CreateAiConvoDto {
  @IsNotEmpty()
  @Length(1, 5000)
  code: string;

  @IsOptional()
  @Length(0, 100)
  algorithmType?: string;

  @IsOptional()
  @Length(0, 500)
  context?: string;
}

export class SubmissionReviewDto extends CreateAiConvoDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  submissionId: number;

  @IsOptional()
  @Length(0, 500)
  context?: string;
}
