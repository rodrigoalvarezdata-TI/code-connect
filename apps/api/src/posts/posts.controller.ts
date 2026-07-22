import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ValidationErrorResponseDto } from '../common/dto/validation-error-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeStateResponseDto } from './dto/like-state-response.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts-response.dto';
import { PostDetailResponseDto } from './dto/post-detail-response.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Lista o feed de publicações',
    description:
      'Público. Aceita busca full-text (`search`) e paginação. Com token ' +
      'válido, `likedByMe` reflete as curtidas do usuário.',
  })
  @ApiOkResponse({ type: PaginatedPostsResponseDto })
  list(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() user: JwtPayload | undefined,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.list(query, user?.sub);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe de uma publicação',
    description: 'Público. Inclui o código e a árvore de comentários (1 nível).',
  })
  @ApiOkResponse({ type: PostDetailResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload | undefined,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.findOne(id, user?.sub);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cria uma publicação' })
  @ApiCreatedResponse({ type: PostDetailResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.create(user.sub, dto);
  }

  @Post(':id/likes')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Curte uma publicação (idempotente)' })
  @ApiCreatedResponse({ type: LikeStateResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeStateResponseDto> {
    return this.postsService.like(id, user.sub);
  }

  @Delete(':id/likes')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a curtida de uma publicação (idempotente)' })
  @ApiOkResponse({ type: LikeStateResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeStateResponseDto> {
    return this.postsService.unlike(id, user.sub);
  }

  @Post(':id/comments')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Comenta em uma publicação',
    description: 'Informe `parentId` para responder a um comentário-raiz.',
  })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  comment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CommentResponseDto> {
    return this.postsService.addComment(id, user.sub, dto);
  }
}
