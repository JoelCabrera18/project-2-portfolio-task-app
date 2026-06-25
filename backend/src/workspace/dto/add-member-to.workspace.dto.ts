import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddMemberToWorkspaceDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: 'a750d349-4f01-4e56-a547-44b25e271d67',
    description: 'Código del nuevo miembro',
  })
  newMemberCode: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: 'a750d349-4f01-4e56-a547-44b25e271d67',
    description: 'Código del workspace',
  })
  workspaceCode: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: 'a750d349-4f01-4e56-a547-44b25e271d67',
    description: 'Código de la invitación al workspace',
  })
  workspaceInvitationCode: string;
}
