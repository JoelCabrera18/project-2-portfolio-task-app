import { ApiProperty } from '@nestjs/swagger';
import { TaskResponse } from './task.response';

export class TaskListResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'Backlog' })
  title: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ type: [TaskResponse] })
  tasks: TaskResponse[];
}
