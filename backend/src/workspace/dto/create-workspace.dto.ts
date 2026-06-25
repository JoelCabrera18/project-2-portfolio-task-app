import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @ApiProperty({
    example: 'Mi workspace',
    description: 'Título del workspace',
    minLength: 5,
    maxLength: 100,
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Descripción de mi workspace',
    description: 'Descripción del workspace',
    required: false,
  })
  description?: string;

  @IsString()
  @MaxLength(25)
  @MinLength(5)
  @IsOptional()
  @ApiProperty({
    example: 'color',
    description: 'Color del workspace',
    minLength: 5,
    maxLength: 25,
    required: false,
  })
  color?: string;
}
