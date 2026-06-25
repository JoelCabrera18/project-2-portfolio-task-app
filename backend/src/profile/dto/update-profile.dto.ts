import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Juan' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Luis' })
  secondName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Perez' })
  firstSurname?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Garcia' })
  secondSurname?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ example: ['+50512345678'] })
  phone?: string[];
}
