import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  code: string;

  @ApiProperty({ example: 'report.pdf' })
  fileName: string;

  @ApiProperty({ example: 2457600 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: '/api/v1/attachment/file/a750d349-4f01-4e56-a547-44b25e271d67' })
  url: string;

  @ApiProperty({ example: '2026-06-20T10:00:00.000Z' })
  createdAt: string;
}
