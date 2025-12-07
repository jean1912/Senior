import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('execution_metrics')
export class ExecutionMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  algorithmId: number;

  @Column({ type: 'int', default: 0 })
  stepsCount: number;

  @Column({ type: 'int', default: 0 })
  comparisons: number;

  @Column({ type: 'int', default: 0 })
  swaps: number;

  @Column({ type: 'int', default: 0 })
  recursionDepth: number;

  @CreateDateColumn()
  createdAt: Date;
}
