import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskList } from '../entities/task-list.entity';
import { TaskListResponse } from 'src/common/responses/task-list.response';
import { FindAllTaskListUseCase } from '../classes/find-all-task-list.class';
import { TaskListMapper } from '../mappers/task-list.mapper';

@Injectable()
export class FindAllTaskListUseCaseImp implements FindAllTaskListUseCase {
  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    private readonly mapper: TaskListMapper,
  ) {}

  async execute(): Promise<TaskListResponse[]> {
    const entities = await this.taskListRepository.find({
      where: { isAvailable: true },
      relations: {
        tasks: {
          labels: {
            label: true,
          },
          assignments: {
            workspaceMember: {
              user: {
                profile: true,
              },
            },
          },
        },
      },
      order: { position: 'ASC', tasks: { position: 'ASC' } },
    });

    return this.mapper.toResponseList(entities);
  }
}
