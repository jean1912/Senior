import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany
} from 'typeorm';
import { Users } from '../user/users.entity';
import { Visualization } from '../visualizations/visualization.entity';
import { Exercise } from '../exercises/exercise.entity';
import { AlgorithmBlock } from './algorithm-block.entity';

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
  complexity: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  pseudocode: string;

  @Column('text', { nullable: true })
  code?: string;

  @Column({ type: 'json', nullable: true })
  structureSchema?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ default: true })
  isPublished: boolean;

  
  @Column({ type: 'json', nullable: true })
  visualFlow?: {
    nodes: Array<{ id: string; label: string; type: string }>;
    edges: Array<{ id?: string; from: string; to: string }>;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: Users;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  lastEditedBy?: Users;

 
  @OneToMany(() => AlgorithmBlock, (b) => b.algorithm, { cascade: true })
  blocks: AlgorithmBlock[];

  @OneToMany(() => Visualization, (v) => v.algorithm, { cascade: true })
  visualizations: Visualization[];

  @OneToMany(() => Exercise, (e) => e.algorithm, { cascade: true })
  exercises: Exercise[];
}
