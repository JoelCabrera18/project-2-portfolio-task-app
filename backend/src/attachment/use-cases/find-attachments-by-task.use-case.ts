import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity';
import { Task } from 'src/task/entities/task.entity';
import { FindAttachmentsByTaskUseCase } from '../classes/find-attachments-by-task.class';

@Injectable()
export class FindAttachmentsByTaskUseCaseImp implements FindAttachmentsByTaskUseCase {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(taskCode: string): Promise<Attachment[]> {
    const task = await this.taskRepository.findOneBy({ code: taskCode, isAvailable: true });
    if (!task) throw new NotFoundException('Task not found');
    return this.attachmentRepository.find({
      where: { task: { id: task.id }, isAvailable: true },
      order: { createdAt: 'DESC' },
    });
  }
}
