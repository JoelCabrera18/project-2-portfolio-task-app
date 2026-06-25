import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceResponse } from './workspace.response';

export class GetInvitationResponse {
  @ApiProperty({ type: WorkspaceResponse })
  workspace: WorkspaceResponse;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  invitationCode: string;
}
