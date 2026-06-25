import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity';
import { FindAttachmentByCodeUseCase } from '../classes/find-attachment-by-code.class';

@Injectable()
export class FindAttachmentByCodeUseCaseImp implements FindAttachmentByCodeUseCase {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async execute(code: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOneBy({ code, isAvailable: true });
    if (!attachment) throw new NotFoundException('Attachment not found');
    return attachment;
  }
}
