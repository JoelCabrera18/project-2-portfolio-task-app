import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskLabel } from '../entities/task-label.entity';
import { DeleteTaskLabelUseCase } from '../classes/delete-task-label.class';

@Injectable()
export class DeleteTaskLabelUseCaseImp implements DeleteTaskLabelUseCase {
  constructor(
    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>,
  ) {}

  async execute(taskId: number, labelId: number): Promise<void> {
    const junction = await this.labelRepository.findOne({
      where: { task: { id: taskId }, label: { id: labelId } },
    });
    if (!junction) throw new NotFoundException('Label not found on task');
    await this.labelRepository.remove(junction);
  }
}
