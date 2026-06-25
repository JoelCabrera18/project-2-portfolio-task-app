import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../entities/label.entity';
import { DeleteLabelUseCase } from '../classes/delete-label.class';

@Injectable()
export class DeleteLabelUseCaseImp implements DeleteLabelUseCase {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async execute(id: number): Promise<Label> {
    const label = await this.labelRepository.findOneBy({ id, isAvailable: true });
    if (!label) throw new NotFoundException('Label not found');

    label.isAvailable = false;
    return this.labelRepository.save(label);
  }
}
