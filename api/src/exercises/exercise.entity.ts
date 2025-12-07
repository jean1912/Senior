import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Users } from '../user/users.entity';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Submission } from '../submissions/submission.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Users, (u) => u.exercises, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  creator?: Users;

  @ManyToOne(() => Algorithm, (a) => a.exercises, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  algorithm: Algorithm;


  // public examples shown to the user
  @Column({ type: 'json', nullable: true })
  visibleTestCases?: any | null;

  // hidden test cases only used by the judge
  @Column({ type: 'json', nullable: true })
  hiddenTestCases?: any | null;

  // contract the user must follow — e.g. "function main(input) { ... }"
  @Column({ type: 'text', nullable: true })
  functionSignature?: string | null;

  // starter JavaScript code
  @Column({ type: 'text', nullable: true })
  starterCode?: string | null;

  // link back from submissions
  @OneToMany(() => Submission, (s) => s.exercise)
  submissions: Submission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
