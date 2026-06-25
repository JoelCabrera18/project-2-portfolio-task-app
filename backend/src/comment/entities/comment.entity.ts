import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { WorkspaceMember } from 'src/workspace/entities/workspace-member.entity';

@Entity({ schema: 'workspaces' })
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true, name: 'commentCode' })
  @Generated('uuid')
  code: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => WorkspaceMember, { nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: WorkspaceMember;

  @Column({ type: 'integer', nullable: true, name: 'parentId' })
  parentId: number | null;

  @Column('jsonb', { nullable: false, default: [] })
  mentions: number[];

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
