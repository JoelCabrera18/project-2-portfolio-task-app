import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';
import { WorkspaceMember } from 'src/workspace/entities/workspace-member.entity';

@Entity({ schema: 'workspaces' })
export class TaskAssignment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Task, (task) => task.assignments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => WorkspaceMember, { nullable: false })
  @JoinColumn({ name: 'workspaceMemberId' })
  workspaceMember: WorkspaceMember;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ nullable: false, default: true })
  isAvailable: boolean;
}
