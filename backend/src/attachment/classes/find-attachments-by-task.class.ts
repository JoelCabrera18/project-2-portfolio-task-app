import { Attachment } from '../entities/attachment.entity';

export abstract class FindAttachmentsByTaskUseCase {
  abstract execute(taskCode: string): Promise<Attachment[]>;
}
