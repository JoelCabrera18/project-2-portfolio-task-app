import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceMemberResponse {
  @ApiProperty({ example: 1 })
  workspaceMemberId: number;

  @ApiProperty({ example: 'Juan Perez' })
  fullname: string;

  @ApiProperty({ example: 'member', enum: ['viewer', 'member'] })
  roleMember: string;

  @ApiProperty({ example: 'juan.perez@mail.com' })
  email: string;

  @ApiProperty({ example: null, required: false })
  photo: string | null;

  @ApiProperty({ example: 'JP' })
  initials: string;

  @ApiProperty({ example: '#ef4444' })
  avatarColor: string;
}
