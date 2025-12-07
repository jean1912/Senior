import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { Submission } from './submission.entity';
import { Users } from '../user/users.entity';
import { Exercise } from '../exercises/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Users, Exercise])],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
