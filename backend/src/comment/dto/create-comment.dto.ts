import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'This is a comment', description: 'Comment content' })
  content: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'Parent comment ID (for replies)', required: false })
  parentId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiProperty({ example: [1, 2], description: 'IDs of mentioned workspace members', required: false })
  mentions?: number[];
}
