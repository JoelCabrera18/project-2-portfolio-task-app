import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { DeleteCommentUseCase } from '../classes/delete-comment.class';

@Injectable()
export class DeleteCommentUseCaseImp implements DeleteCommentUseCase {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async execute(code: string, userId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { code, isAvailable: true },
      relations: { author: { user: true } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.user.id !== userId) throw new ForbiddenException('You can only delete your own comments');

    comment.isAvailable = false;
    return this.commentRepository.save(comment);
  }
}
