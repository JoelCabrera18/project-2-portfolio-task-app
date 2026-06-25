import { ApiProperty } from '@nestjs/swagger';

export class SendInvitationResponse {
  @ApiProperty({ example: 'https://frontend.com/invite/a750d349-4f01-4e56-a547-44b25e271d67' })
  inviteLink: string;
}
