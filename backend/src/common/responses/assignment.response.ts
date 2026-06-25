import { ApiProperty } from '@nestjs/swagger';

export class AssignmentResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  workspaceMemberId: number;

  @ApiProperty({ example: 'Juan Perez' })
  fullname: string;

  @ApiProperty({ example: 'juan.perez@mail.com' })
  email: string;

  @ApiProperty({ example: null, required: false })
  photo: string | null;

  @ApiProperty({ example: 'JP' })
  initials: string;

  @ApiProperty({ example: '#4A90E2' })
  avatarColor: string;
}
