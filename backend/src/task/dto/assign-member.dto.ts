import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMemberDto {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del miembro del workspace',
  })
  workspaceMemberId: number;
}
