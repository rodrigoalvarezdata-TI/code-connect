import { ApiProperty } from '@nestjs/swagger';
import { PostSummaryResponseDto } from './post-summary-response.dto';

/** Página do feed. */
export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [PostSummaryResponseDto] })
  items: PostSummaryResponseDto[];

  @ApiProperty({ description: 'Total de posts que casam com o filtro.', example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;

  @ApiProperty({
    description: 'Se há mais páginas depois desta.',
    example: true,
  })
  hasNextPage: boolean;
}
