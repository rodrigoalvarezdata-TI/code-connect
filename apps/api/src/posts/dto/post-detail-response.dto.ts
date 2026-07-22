import { ApiProperty } from '@nestjs/swagger';
import type { Comment } from '../entities/comment.entity';
import type { Post } from '../entities/post.entity';
import { CommentResponseDto } from './comment-response.dto';
import { PostSummaryResponseDto } from './post-summary-response.dto';

/** Post na página de detalhe: tudo do card + o código e a árvore de comentários. */
export class PostDetailResponseDto extends PostSummaryResponseDto {
  @ApiProperty({
    description: 'Trecho de código do post (bloco "Código:").',
    example: "const useToggle = () => { /* ... */ }",
  })
  content: string;

  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  /**
   * @param post entidade do post (com autor e contadores carregados)
   * @param rootComments comentários-raiz do post, cada um com `author` e
   *   `replies` (com `author`) já carregados
   */
  static fromEntityWithComments(
    post: Post,
    rootComments: Comment[],
  ): PostDetailResponseDto {
    const dto = new PostDetailResponseDto();
    PostDetailResponseDto.assignBase(dto, post);
    dto.content = post.content;
    dto.comments = rootComments.map((comment) =>
      CommentResponseDto.fromEntity(comment),
    );
    return dto;
  }
}
