import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../user/users.entity';
import { Exercise } from '../exercises/exercise.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  // user code (JS solution)
  @Column({ type: 'text', nullable: true })
  content?: string;

  @ManyToOne(() => Users, (u) => u.submissions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: Users;

  // 🔗 NEW: which exercise this submission belongs to
  @ManyToOne(() => Exercise, (e) => e.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exercise: Exercise;

  // 🔢 grading stats
  @Column({ type: 'int', nullable: true })
  passedCount?: number | null;

  @Column({ type: 'int', nullable: true })
  failedCount?: number | null;

  @Column({ type: 'int', nullable: true })
  totalCount?: number | null;

  // 0–100
  @Column({ type: 'int', nullable: true })
  score?: number | null;

  // detailed per-test results
  @Column({ type: 'json', nullable: true })
  resultJson?: any | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
