import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Users } from '../user/users.entity';
import { Visualization } from '../visualizations/visualization.entity';
import { Exercise } from '../exercises/exercise.entity';

@Entity('algorithms')
export class Algorithm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['Sorting', 'Searching', 'Graph', 'Tree', 'Dynamic', 'Greedy', 'Other'],
    default: 'Other',
  })
  category: string;

  @Column({ length: 50 })
  complexity: string; // e.g. O(n log n)

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  pseudocode: string;

  @Column('text', { nullable: true })
  code?: string; // Optional JS or pseudocode logic for advanced visualization

  @Column({ type: 'json', nullable: true })
  structureSchema?: Record<string, any>; // For data structures (like trees)

  @Column({ type: 'json', nullable: true })
  validationRules?: Record<string, any>; // For validation (e.g., red-black tree rules)

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: Users;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  lastEditedBy?: Users;

  @OneToMany(() => Visualization, (v) => v.algorithm, { cascade: true })
  visualizations: Visualization[];

  @OneToMany(() => Exercise, (e) => e.algorithm, { cascade: true })
  exercises: Exercise[];
}
