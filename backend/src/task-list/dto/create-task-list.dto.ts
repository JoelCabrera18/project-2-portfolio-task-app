import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateTaskListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiProperty({ example: 'Backlog', description: 'Title of the task list' })
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'ID of the board this list belongs to' })
  boardId: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 0, description: 'Display order position' })
  position: number;
}
