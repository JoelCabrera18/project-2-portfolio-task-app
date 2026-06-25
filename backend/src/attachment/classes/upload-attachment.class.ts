import { Attachment } from '../entities/attachment.entity';

export abstract class UploadAttachmentUseCase {
  abstract execute(file: Express.Multer.File, taskCode: string, userId: number): Promise<Attachment>;
}
