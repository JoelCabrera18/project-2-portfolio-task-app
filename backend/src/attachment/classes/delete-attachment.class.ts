import { Attachment } from '../entities/attachment.entity';

export abstract class DeleteAttachmentUseCase {
  abstract execute(code: string): Promise<Attachment>;
}
