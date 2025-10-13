import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Algorithm, (a) => a.exercises, { onDelete: 'CASCADE' })
  algorithm: Algorithm;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: Users;
}
