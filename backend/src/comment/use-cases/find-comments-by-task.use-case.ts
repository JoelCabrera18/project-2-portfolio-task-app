import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Task } from 'src/task/entities/task.entity';
import { FindCommentsByTaskUseCase } from '../classes/find-comments-by-task.class';

@Injectable()
export class FindCommentsByTaskUseCaseImp implements FindCommentsByTaskUseCase {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(taskCode: string): Promise<Comment[]> {
    const task = await this.taskRepository.findOneBy({ code: taskCode, isAvailable: true });
    if (!task) throw new NotFoundException('Task not found');
    return this.commentRepository.find({
      where: { task: { id: task.id }, isAvailable: true },
      relations: { author: { user: { profile: true } } },
      order: { createdAt: 'ASC' },
    });
  }
}
