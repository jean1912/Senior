import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('algorithm_templates')
export class AlgorithmTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ length: 64 })
  category: string;

  @Column({ length: 128 })
  title: string;

  @Column('text')
  description: string;

  @Column('text')
  pseudocode: string;

  @Column('text')
  starterCode: string; 

  @Column({ type: 'json', nullable: true })
  visualFlow?: {
    nodes: Array<{ id: string; label: string; type: string }>;
    edges: Array<{ id?: string; from: string; to: string }>;
  };
}
