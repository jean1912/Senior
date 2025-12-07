import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Algorithm } from './algorithm.entity';

@Entity('algorithm_blocks')
export class AlgorithmBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string; 

  @Column({ type: 'json', nullable: true })
  parameters?: Record<string, any>;

  @Column('text', { nullable: true })
  codeSnippet?: string;

  @Column({ type: 'int', default: 0 })
  order: number; 

  @ManyToOne(() => Algorithm, (algo) => algo.blocks, { onDelete: 'CASCADE' })
  algorithm: Algorithm;
}
