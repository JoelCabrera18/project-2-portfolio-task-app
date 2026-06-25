import { Comment } from '../entities/comment.entity';

export abstract class FindCommentsByTaskUseCase {
  abstract execute(taskCode: string): Promise<Comment[]>;
}
