import { Comment } from '../entities/comment.entity';

export abstract class DeleteCommentUseCase {
  abstract execute(code: string, userId: number): Promise<Comment>;
}
