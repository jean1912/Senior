import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { Users } from '../user/users.entity';
import { Algorithm } from '../algorithms/algorithm.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepo: Repository<Exercise>,

    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,

    @InjectRepository(Algorithm)
    private readonly algoRepo: Repository<Algorithm>,
  ) {}

  async create(dto: CreateExerciseDto, userId: number) {
    const algo = await this.algoRepo.findOne({ where: { id: dto.algorithmId } });
    if (!algo) throw new BadRequestException('Algorithm not found');

    const user = await this.usersRepo.findOne({ where: { id: userId } });

    // strip algorithmId from dto
    const { algorithmId, ...rest } = dto as any;

    const exercise = this.exerciseRepo.create({
      ...rest,
      algorithm: algo,
      creator: user ?? undefined,
    });

    return this.exerciseRepo.save(exercise);
  }

  async findAll() {
    return this.exerciseRepo.find({
      relations: ['creator', 'algorithm'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const ex = await this.exerciseRepo.findOne({
      where: { id },
      relations: ['creator', 'algorithm'],
    });
    if (!ex) throw new NotFoundException('Exercise not found');
    return ex;
  }

  async update(id: number, dto: UpdateExerciseDto, userId: number) {
    const ex = await this.exerciseRepo.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!ex) throw new NotFoundException('Exercise not found');

    if (ex.creator && ex.creator.id !== userId) {
      throw new ForbiddenException('You can only edit your own exercises');
    }

    const { algorithmId, ...rest } = dto as any; // ignore algo change
    Object.assign(ex, rest);

    return this.exerciseRepo.save(ex);
  }

  async remove(id: number, userId: number) {
    const ex = await this.exerciseRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!ex) throw new NotFoundException('Exercise not found');

    if (ex.creator && ex.creator.id !== userId) {
      throw new ForbiddenException('You can only delete your own exercises');
    }

    await this.exerciseRepo.remove(ex);
    return { ok: true };
  }
}
