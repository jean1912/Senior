// src/ai/ai-convo.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AlgoQuestionDto,
  ExerciseQuestionDto,
  CodeReviewDto,
  SubmissionReviewDto,
} from './dto/ai-convo.dto';

import { Algorithm } from '../algorithms/algorithm.entity';
import { Exercise } from '../exercises/exercise.entity';
import { Submission } from '../submissions/submission.entity';

import {
  AlgorithmCommands,
  AlgorithmDetail,
  CodeReviewCommands,
  ExerciseCommands,
  ExerciseDetail,
} from './prompts';

@Injectable()
export class AiConvoService {
  private readonly baseUrl = 'https://ollama.com/api';

  constructor(
    private readonly config: ConfigService,

    @InjectRepository(Algorithm)
    private algoRepo: Repository<Algorithm>,

    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
  ) {}

  // -------------------------------------------------------------------------
  // GENERATE AI CONTENT
  // -------------------------------------------------------------------------
 async generateContent(prompt: string, model = 'llama3') {
  const response = await fetch(`http://localhost:11434/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new HttpException(err, HttpStatus.BAD_GATEWAY);
  }

  const json = await response.json();
  return json.response;
}


  // -------------------------------------------------------------------------
  // EXPLAIN ALGORITHM
  // -------------------------------------------------------------------------
 async explainAlgorithm(dto: AlgoQuestionDto) {

  // if algorithmId is 0 → generic explanation mode (no DB)
  if (dto.algorithmId === 0) {
    const question = dto.question || "Explain this algorithm in simple terms.";
    const prompt = `
User question: "${question}"

Explain in a simple educational way.  
Include:
1. What the concept means  
2. How it works  
3. Why it is useful  
4. A simple example  
`;

    return this.generateContent(prompt);
  }

  // otherwise → normal mode (fetch algorithm from DB)
  const algo = await this.algoRepo.findOne({ where: { id: dto.algorithmId } });
  if (!algo) throw new HttpException('Algorithm not found', 404);

  const questionPart = dto.question
    ? `User question: "${dto.question}"\n\n`
    : '';

  const detail = AlgorithmDetail({
    name: algo.name,
    description: algo.description,
    complexity: algo.complexity,
  });

  const prompt = `${questionPart}${detail}\n${AlgorithmCommands}`;
  return this.generateContent(prompt);
}

  // -------------------------------------------------------------------------
  // EXERCISE HINTS
  // -------------------------------------------------------------------------
  async generateExerciseHints(dto: ExerciseQuestionDto) {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: dto.exerciseId },
      relations: ['algorithm'],
    });

    if (!exercise) throw new HttpException('Exercise not found', 404);

    const algo = exercise.algorithm;

    const algorithmsToUse = [{ name: algo.name, complexity: algo.complexity }];

    const questionPart = dto.question
      ? `Specific question: "${dto.question}"\n\n`
      : '';

    const contextPart = dto.context
      ? `User code so far: "${dto.context}"\n\n`
      : '';

    const detail = ExerciseDetail(
      { description: exercise.description || 'No description' },
      algorithmsToUse,
    );

    const prompt = `${questionPart}${contextPart}${detail}\n${ExerciseCommands}`;
    return this.generateContent(prompt);
  }

  // -------------------------------------------------------------------------
  // CODE REVIEW
  // -------------------------------------------------------------------------
  async reviewCode(dto: CodeReviewDto) {
    const questionPart = dto.question
      ? `User question: "${dto.question}"\n\n`
      : '';

    const contextPart = dto.context
      ? `Context: "${dto.context}"\n\n`
      : '';

    const algorithmType = dto.algorithmType
      ? `Algorithm type: ${dto.algorithmType}\n\n`
      : '';

    const prompt = `
${questionPart}${contextPart}${algorithmType}
Code to review:
\`\`\`js
${dto.code}
\`\`\`

${CodeReviewCommands}
`;

    return this.generateContent(prompt);
  }

  // -------------------------------------------------------------------------
  // REVIEW SUBMISSION
  // -------------------------------------------------------------------------
  async reviewSubmission(dto: SubmissionReviewDto) {
    const submission = await this.submissionRepo.findOne({
      where: { id: dto.submissionId },
      relations: ['exercise', 'exercise.algorithm'],
    });

    if (!submission) throw new HttpException('Submission not found', 404);

    if (!submission.content)
      throw new HttpException('Submission has no content', 400);

    const codeReviewDto: CodeReviewDto = {
      question: dto.question,
      context: dto.context,
      code: submission.content,
      algorithmType: submission.exercise.algorithm.category,
    };

    return this.reviewCode(codeReviewDto);
  }
}
