import { ApiProperty } from '@nestjs/swagger';

export class LabelResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'Bug' })
  name: string;

  @ApiProperty({ example: '#FF0000' })
  color: string;
}
