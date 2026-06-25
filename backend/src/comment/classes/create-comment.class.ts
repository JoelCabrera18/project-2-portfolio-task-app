import { Comment } from '../entities/comment.entity';

export abstract class CreateCommentUseCase {
  abstract execute(content: string, taskCode: string, authorId: number, parentId?: number, mentions?: number[]): Promise<Comment>;
}
