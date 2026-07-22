import { ApiProperty } from '@nestjs/swagger';
import type { Comment } from '../entities/comment.entity';
import { PostAuthorDto } from './post-author.dto';

/**
 * Comentário na resposta. Um comentário-raiz traz suas `replies` (1 nível);
 * respostas vêm com `replies: []`.
 */
export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Quanto tempo você levou para finalizar?' })
  body: string;

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: [CommentResponseDto] })
  replies: CommentResponseDto[];

  static fromEntity(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.body = comment.body;
    dto.author = PostAuthorDto.fromEntity(comment.author);
    dto.createdAt = comment.createdAt.toISOString();
    // Ordena respostas por data e mapeia; respostas não têm sub-respostas.
    dto.replies = (comment.replies ?? [])
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((reply) => CommentResponseDto.fromEntity(reply));
    return dto;
  }
}
