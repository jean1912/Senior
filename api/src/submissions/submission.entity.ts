import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { Users } from '../user/users.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content?: string; // placeholder for user-submitted code

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Users, (u) => u.submissions, { onDelete: 'CASCADE' })
  user: Users;
}
