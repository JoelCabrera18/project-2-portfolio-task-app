import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskList } from 'src/task-list/entities/task-list.entity';
import { ReorderTasksDto } from '../dto/reorder-tasks.dto';
import { ReorderTasksUseCase } from '../classes/reorder-tasks.class';

@Injectable()
export class ReorderTasksUseCaseImp implements ReorderTasksUseCase {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
  ) {}

  async execute(dto: ReorderTasksDto): Promise<void> {
    if (dto.taskIds.length === 0) return;

    const list = await this.taskListRepository.findOneBy({ id: dto.listId });
    if (!list) throw new NotFoundException('Task list not found');

    const existing = await this.taskRepository.findBy({ id: In(dto.taskIds) });
    if (existing.length !== dto.taskIds.length) {
      throw new NotFoundException('Some tasks not found');
    }

    const taskMap = new Map(existing.map((t) => [t.id, t]));

    const ordered = dto.taskIds.map((id, index) => {
      const task = taskMap.get(id)!;
      task.position = index + 1;
      task.taskList = { id: dto.listId } as TaskList;
      return task;
    });

    await this.taskRepository.save(ordered);
  }
}
