import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';
import { Label } from 'src/label/entities/label.entity';

@Entity({ schema: 'workspaces' })
export class TaskLabel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true, name: 'labelCode' })
  @Generated('uuid')
  code: string;

  @ManyToOne(() => Task, (task) => task.labels, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => Label, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'labelId' })
  label: Label;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
