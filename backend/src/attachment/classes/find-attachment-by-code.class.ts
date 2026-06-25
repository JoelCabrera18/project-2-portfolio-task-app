import { Attachment } from '../entities/attachment.entity';

export abstract class FindAttachmentByCodeUseCase {
  abstract execute(code: string): Promise<Attachment>;
}
