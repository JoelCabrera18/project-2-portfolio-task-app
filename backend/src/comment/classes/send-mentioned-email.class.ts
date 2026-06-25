import { Comment } from '../entities/comment.entity';

export abstract class SendMentionedEmailUseCase {
  abstract execute(comment: Comment): Promise<void>;
}
