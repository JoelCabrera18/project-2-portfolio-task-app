import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskLabelDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de la etiqueta del workspace' })
  labelId: number;
}
