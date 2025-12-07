import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Visualization } from '../visualizations/visualization.entity';
import { Submission } from '../submissions/submission.entity';
import { Exercise } from '../exercises/exercise.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false }) // password won’t show up in queries unless explicitly selected
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // ✅ Relations for later expansion
  @OneToMany(() => Visualization, (v) => v.user, { cascade: true })
  visualizations: Visualization[];

  @OneToMany(() => Submission, (s) => s.user, { cascade: true })
  submissions: Submission[];
  @OneToMany(() => Exercise, (e) => e.creator, { cascade: true })
exercises: Exercise[];
}
