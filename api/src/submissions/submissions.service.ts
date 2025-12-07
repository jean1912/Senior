import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Submission } from './submission.entity';
import { Users } from '../user/users.entity';
import { Exercise } from '../exercises/exercise.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import * as vm from 'vm';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,

    @InjectRepository(Exercise)
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  // ========== SIMPLE CREATE (old text submission) =============

  async create(dto: CreateSubmissionDto, userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    const submission = this.submissionRepo.create({
      content: dto.content,
      user: user ?? undefined,
      // no exercise / score here – this is generic
    });

    return this.submissionRepo.save(submission);
  }

  async findAll(query?: string) {
    const where = query ? { content: Like(`%${query}%`) } : {};

    return this.submissionRepo.find({
      where,
      relations: ['user', 'exercise'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['user', 'exercise'],
    });
    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }

  async update(id: number, dto: UpdateSubmissionDto, userId: number) {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.user && submission.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own submissions');
    }

    Object.assign(submission, dto);
    return this.submissionRepo.save(submission);
  }

  async remove(id: number, userId: number) {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.user && submission.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own submissions');
    }

    await this.submissionRepo.remove(submission);
    return { ok: true };
  }

  // ========== NEW: JUDGER =============

  private async runUserCode(code: string, input: any, timeLimitMs = 2000) {
    const sandbox: any = {
      input,
      console: { log: () => {} }, // silence user logs
      result: undefined,
    };

    const wrapped = `
      "use strict";
      ${code}
      if (typeof main !== "function") {
        throw new Error("main(input) not defined");
      }
      result = main(input);
    `;

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrapped);

    try {
      script.runInContext(context, { timeout: timeLimitMs });
      return { result: sandbox.result, error: null };
    } catch (err: any) {
      return { result: undefined, error: String(err.message ?? err) };
    }
  }

  async grade(dto: GradeSubmissionDto, userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const exercise = await this.exerciseRepo.findOne({
      where: { id: dto.exerciseId },
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    const visible = (exercise.visibleTestCases as any[]) || [];
    const hidden = (exercise.hiddenTestCases as any[]) || [];
    const tests = [...visible, ...hidden];

    if (!tests.length) {
      throw new BadRequestException(
        'Exercise has no test cases configured for grading.',
      );
    }

    const results: any[] = [];
    let passed = 0;

    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      const input = t.input;
      const expected = t.output;

      const { result, error } = await this.runUserCode(dto.code, input);

      const pass =
        !error &&
        JSON.stringify(result) === JSON.stringify(expected);

      if (pass) passed++;

      results.push({
        index: i,
        input,
        expected,
        received: result,
        pass,
        error,
        hidden: i >= visible.length, // mark which ones are hidden
      });
    }

    const total = tests.length;
    const failed = total - passed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    const submission = this.submissionRepo.create({
      content: dto.code,
      user: user ?? undefined,
      exercise,
      passedCount: passed,
      failedCount: failed,
      totalCount: total,
      score,
      resultJson: results,
    });

    const saved = await this.submissionRepo.save(submission);

    return {
      submissionId: saved.id,
      score,
      passed,
      failed,
      total,
      results,
      created_at: saved.created_at,
    };
  }
}
