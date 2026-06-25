import { ApiProperty } from '@nestjs/swagger';
import { LabelResponse } from './label.response';
import { AssignmentResponse } from './assignment.response';

export class TaskResponse {
  @ApiProperty({ example: 1 })
  taskId: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'Implementar login' })
  title: string;

  @ApiProperty({ example: 'Descripcion de la tarea', required: false })
  description: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  dateInit?: Date;

  @ApiProperty({ example: '2026-12-31', required: false })
  dateEnd?: Date;

  @ApiProperty({ example: false })
  completed: boolean;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ type: [LabelResponse], required: false })
  labels?: LabelResponse[];

  @ApiProperty({ type: [AssignmentResponse], required: false })
  assignees?: AssignmentResponse[];

  @ApiProperty({ example: 0, required: false })
  commentsCount?: number;

  @ApiProperty({ example: 0, required: false })
  attachmentsCount?: number;
}
