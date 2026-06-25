import { ApiProperty } from '@nestjs/swagger';

export class CommentResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'This is a comment' })
  content: string;

  @ApiProperty({ example: { id: 1, fullname: 'John Doe', initials: 'JD', avatarColor: '#ef4444' } })
  author: {
    id: number;
    fullname: string;
    email: string;
    photo: string | null;
    initials: string;
    avatarColor: string;
  };

  @ApiProperty({ example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ example: [], description: 'Mentioned workspace member IDs' })
  mentions: number[];

  @ApiProperty({ example: '2026-06-20T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: [], isArray: true })
  replies?: CommentResponse[];
}
