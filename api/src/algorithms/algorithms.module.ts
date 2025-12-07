import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Algorithm } from './algorithm.entity';
import { AlgorithmsController } from './algorithms.controller';
import { AlgorithmsService } from './algorithms.service';
import { Users } from '../user/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Algorithm, Users])],
  controllers: [AlgorithmsController],
  providers: [AlgorithmsService],
  exports: [AlgorithmsService],
})
export class AlgorithmsModule {}
