import { Task } from 'src/task/entities/task.entity';
import { Board } from 'src/workspace/entities/board.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'workspaces' })
export class TaskList {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Board, (board) => board.taskList, { eager: true, nullable: false })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column('uuid', { name: 'taskListCode' })
  @Generated('uuid')
  code: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  position: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @OneToMany(() => Task, (task) => task.taskList)
  tasks: Task[];
}
