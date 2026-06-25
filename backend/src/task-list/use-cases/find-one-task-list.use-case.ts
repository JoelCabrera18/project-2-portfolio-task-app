import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskList } from '../entities/task-list.entity';
import { TaskListResponse } from 'src/common/responses/task-list.response';
import { FindOneTaskListUseCase } from '../classes/find-one-task-list.class';
import { TaskListMapper } from '../mappers/task-list.mapper';

@Injectable()
export class FindOneTaskListUseCaseImp implements FindOneTaskListUseCase {
  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    private readonly mapper: TaskListMapper,
  ) {}

  async execute(id: number): Promise<TaskListResponse> {
    const entity = await this.taskListRepository.findOne({
      where: { id, isAvailable: true },
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

    if (!entity) throw new NotFoundException('Task list not found');

    return this.mapper.toResponse(entity);
  }
}
