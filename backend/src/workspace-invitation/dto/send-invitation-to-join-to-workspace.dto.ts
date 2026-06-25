import { IsEmail, IsIn, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendInvitationToJoinToWorkspaceDto {
  @IsUUID()
  @ApiProperty({
    example: 'a750d349-4f01-4e56-a547-44b25e271d67',
    description: 'Código del workspace',
  })
  workspaceCode: string;

  @IsEmail()
  @ApiProperty({
    example: ['joel.cabrera.parrales@mail.com'],
    description: 'Correo electrónico del usuario invitado',
  })
  invitedEmail: string;

  @IsEmail()
  @ApiProperty({
    example: ['joel.cabrera.parrales@mail.com'],
    description: 'Correo electrónico del usuario invitado',
  })
  inviterEmail: string;

  @IsString()
  @IsIn(['member', 'viewer'])
  @ApiProperty({
    example: 'member',
    description: 'Rol del usuario invitado',
  })
  rolMember: string;
}
