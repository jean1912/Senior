import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../user/users.entity';
import { Algorithm } from '../algorithms/algorithm.entity';

@Entity('visualizations')
export class Visualization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  structureType: string; // e.g. "Tree", "Graph", "Array"

  @Column('json', { nullable: true })
  stateJson: any; // stores node positions, edges, steps, etc.

  @Column({ default: 0 })
  stepCount: number; // number of visualization steps

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.visualizations, {
    onDelete: 'CASCADE',
  })
  algorithm: Algorithm;

  @ManyToOne(() => Users, (user) => user.visualizations, {
    onDelete: 'CASCADE',
  })
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
