import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity';
import { DeleteAttachmentUseCase } from '../classes/delete-attachment.class';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DeleteAttachmentUseCaseImp implements DeleteAttachmentUseCase {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async execute(code: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOneBy({ code, isAvailable: true });
    if (!attachment) throw new NotFoundException('Attachment not found');

    attachment.isAvailable = false;
    const saved = await this.attachmentRepository.save(attachment);

    const filePath = path.join(process.cwd(), 'uploads', 'attachments', attachment.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return saved;
  }
}
