import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberResponse } from './workspace-member.response';
import { BoardResponse } from './board.response';

export class WorkspaceResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'mi-workspace' })
  slugCode: string;

  @ApiProperty({ example: 'Mi Workspace' })
  title: string;

  @ApiProperty({ example: 'Descripcion del workspace', required: false })
  description: string;

  @ApiProperty({ example: '#4A90E2', required: false })
  color?: string;

  @ApiProperty({ example: 1 })
  status: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', required: false })
  updatedAt?: Date;

  @ApiProperty({ type: [WorkspaceMemberResponse] })
  workspaceMembers: WorkspaceMemberResponse[];

  @ApiProperty({ type: [BoardResponse] })
  boards: BoardResponse[];
}
