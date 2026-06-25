import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../entities/label.entity';
import { UpdateLabelDto } from '../dto/update-label.dto';
import { UpdateLabelUseCase } from '../classes/update-label.class';

@Injectable()
export class UpdateLabelUseCaseImp implements UpdateLabelUseCase {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async execute(id: number, dto: UpdateLabelDto): Promise<Label> {
    const label = await this.labelRepository.findOneBy({ id, isAvailable: true });
    if (!label) throw new NotFoundException('Label not found');

    if (dto.name !== undefined) label.name = dto.name;
    if (dto.color !== undefined) label.color = dto.color;

    return this.labelRepository.save(label);
  }
}
