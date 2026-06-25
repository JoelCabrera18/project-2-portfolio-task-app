import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskList } from '../entities/task-list.entity';
import { DeleteTaskListUseCase } from '../classes/delete-task-list.class';

@Injectable()
export class DeleteTaskListUseCaseImp implements DeleteTaskListUseCase {
  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
  ) {}

  async execute(id: number): Promise<void> {
    const entity = await this.taskListRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Task list not found');

    entity.isAvailable = false;
    await this.taskListRepository.save(entity);
  }
}
