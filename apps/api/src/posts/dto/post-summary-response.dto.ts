import { ApiProperty } from '@nestjs/swagger';
import type { Post } from '../entities/post.entity';
import { PostAuthorDto } from './post-author.dto';

/** Post como aparece no card do feed (sem o corpo de código nem comentários). */
export class PostSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Como criar hooks reutilizáveis no React' })
  title: string;

  @ApiProperty({ example: 'Um guia prático sobre custom hooks.' })
  description: string;

  @ApiProperty({ nullable: true, example: null })
  thumbnailUrl: string | null;

  @ApiProperty({ type: [String], example: ['React', 'Hooks'] })
  tags: string[];

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty({ example: 12 })
  likesCount: number;

  @ApiProperty({ example: 3 })
  commentsCount: number;

  @ApiProperty({
    description: 'Se o usuário autenticado curtiu (false para visitantes).',
    example: false,
  })
  likedByMe: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  static fromEntity(post: Post): PostSummaryResponseDto {
    const dto = new PostSummaryResponseDto();
    PostSummaryResponseDto.assignBase(dto, post);
    return dto;
  }

  /** Compartilha o mapeamento com o DTO de detalhe, que estende este. */
  protected static assignBase(dto: PostSummaryResponseDto, post: Post): void {
    dto.id = post.id;
    dto.title = post.title;
    dto.description = post.description;
    dto.thumbnailUrl = post.thumbnailUrl;
    dto.tags = post.tags ?? [];
    dto.author = PostAuthorDto.fromEntity(post.author);
    dto.likesCount = post.likesCount ?? 0;
    dto.commentsCount = post.commentsCount ?? 0;
    dto.likedByMe = Boolean(post.likedByMe);
    dto.createdAt = post.createdAt.toISOString();
  }
}
