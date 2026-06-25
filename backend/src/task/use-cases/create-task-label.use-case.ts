import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskLabel } from '../entities/task-label.entity';
import { Label } from 'src/label/entities/label.entity';
import { CreateTaskLabelDto } from '../dto/create-task-label.dto';
import { CreateTaskLabelUseCase } from '../classes/create-task-label.class';

@Injectable()
export class CreateTaskLabelUseCaseImp implements CreateTaskLabelUseCase {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>,
    @InjectRepository(Label)
    private readonly labelEntityRepository: Repository<Label>,
  ) {}

  async execute(taskId: number, dto: CreateTaskLabelDto): Promise<TaskLabel> {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException('Task not found');

    const label = await this.labelEntityRepository.findOneBy({ id: dto.labelId });
    if (!label) throw new NotFoundException('Label not found');

    const junction = this.labelRepository.create({ task, label });
    return this.labelRepository.save(junction);
  }
}
