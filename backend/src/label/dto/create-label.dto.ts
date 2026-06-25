import { IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({ example: 'Bug', description: 'Nombre de la etiqueta' })
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({ example: '#EF4444', description: 'Color de la etiqueta' })
  color: string;

  @IsString()
  @IsUUID()
  @ApiProperty({ example: 'a750d349-...', description: 'Código del workspace' })
  workspaceCode: string;
}
