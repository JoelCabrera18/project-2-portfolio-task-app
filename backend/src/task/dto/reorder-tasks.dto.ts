import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderTasksDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: 'ID de la lista de tareas' })
  listId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({ example: [3, 1, 2], description: 'IDs de las tareas en el nuevo orden' })
  taskIds: number[];
}
