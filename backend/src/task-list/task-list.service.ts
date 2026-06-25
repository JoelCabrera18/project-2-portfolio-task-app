import { Injectable } from '@nestjs/common';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { CreateTaskListUseCase } from './classes/create-task-list.class';
import { FindAllTaskListUseCase } from './classes/find-all-task-list.class';
import { FindOneTaskListUseCase } from './classes/find-one-task-list.class';
import { UpdateTaskListUseCase } from './classes/update-task-list.class';
import { DeleteTaskListUseCase } from './classes/delete-task-list.class';
import { TaskListResponse } from 'src/common/responses/task-list.response';

@Injectable()
export class TaskListService {
  constructor(
    private readonly createUseCase: CreateTaskListUseCase,
    private readonly findAllUseCase: FindAllTaskListUseCase,
    private readonly findOneUseCase: FindOneTaskListUseCase,
    private readonly updateUseCase: UpdateTaskListUseCase,
    private readonly deleteUseCase: DeleteTaskListUseCase,
  ) {}

  create(createTaskListDto: CreateTaskListDto): Promise<TaskListResponse> {
    return this.createUseCase.execute(createTaskListDto);
  }

  findAll(): Promise<TaskListResponse[]> {
    return this.findAllUseCase.execute();
  }

  findOne(id: number): Promise<TaskListResponse> {
    return this.findOneUseCase.execute(id);
  }

  update(id: number, updateTaskListDto: UpdateTaskListDto): Promise<TaskListResponse> {
    return this.updateUseCase.execute(id, updateTaskListDto);
  }

  remove(id: number): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
