import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskList } from '../entities/task-list.entity';
import { UpdateTaskListDto } from '../dto/update-task-list.dto';
import { TaskListResponse } from 'src/common/responses/task-list.response';
import { UpdateTaskListUseCase } from '../classes/update-task-list.class';
import { TaskListMapper } from '../mappers/task-list.mapper';

@Injectable()
export class UpdateTaskListUseCaseImp implements UpdateTaskListUseCase {
  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    private readonly mapper: TaskListMapper,
  ) {}

  async execute(id: number, dto: UpdateTaskListDto): Promise<TaskListResponse> {
    const entity = await this.taskListRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Task list not found');

    this.taskListRepository.merge(entity, dto);
    await this.taskListRepository.save(entity);

    const full = await this.taskListRepository.findOne({
      where: { id },
      relations: {
        tasks: {
          labels: true,
          assignments: {
            workspaceMember: {
              user: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return this.mapper.toResponse(full!);
  }
}
