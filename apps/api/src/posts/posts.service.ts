import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  QueryFailedError,
  Repository,
  type SelectQueryBuilder,
} from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { LikeStateResponseDto } from './dto/like-state-response.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts-response.dto';
import { PostDetailResponseDto } from './dto/post-detail-response.dto';
import { PostSummaryResponseDto } from './dto/post-summary-response.dto';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { FTS_CONFIG, PG_UNIQUE_VIOLATION } from './posts.constants';

/** Uma linha do resultado cru de `getRawAndEntities`, com os contadores. */
interface CountRaw {
  likes_count?: string | number;
  comments_count?: string | number;
  liked_by_me?: string | number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly likesRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  /** Feed paginado, com busca full-text opcional. `currentUserId` só existe
   * quando há sessão — é o que popula `likedByMe`. */
  async list(
    query: ListPostsQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedPostsResponseDto> {
    const { page, limit, search } = query;
    const term = search?.trim();

    const qb = this.baseQuery(currentUserId)
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (term) {
      this.applySearch(qb, term);
    }

    // Total conta em query própria (sem os selects de contagem/paginação).
    const countQb = this.postsRepository.createQueryBuilder('post');
    if (term) {
      this.applySearch(countQb, term);
    }

    const [{ entities, raw }, total] = await Promise.all([
      qb.getRawAndEntities<CountRaw>(),
      countQb.getCount(),
    ]);
    this.hydrateCounts(entities, raw, currentUserId);

    return {
      items: entities.map((post) => PostSummaryResponseDto.fromEntity(post)),
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  async findOne(
    id: string,
    currentUserId?: string,
  ): Promise<PostDetailResponseDto> {
    const { entities, raw } = await this.baseQuery(currentUserId)
      .where('post.id = :id', { id })
      .getRawAndEntities<CountRaw>();

    const post = entities[0];
    if (!post) {
      throw new NotFoundException('Publicação não encontrada');
    }
    this.hydrateCounts(entities, raw, currentUserId);

    // Comentários-raiz com autor e respostas (cada resposta com autor). A
    // ordenação das respostas é feita no DTO.
    const rootComments = await this.commentsRepository.find({
      where: { postId: id, parentId: IsNull() },
      relations: { author: true, replies: { author: true } },
      order: { createdAt: 'ASC' },
    });

    return PostDetailResponseDto.fromEntityWithComments(post, rootComments);
  }

  async create(
    authorId: string,
    dto: CreatePostDto,
  ): Promise<PostDetailResponseDto> {
    const post = this.postsRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      content: dto.content,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      tags: this.normalizeTags(dto.tags),
      authorId,
    });

    const saved = await this.postsRepository.save(post);
    // Relê pelo caminho normal para trazer autor, contadores e likedByMe.
    return this.findOne(saved.id, authorId);
  }

  async like(postId: string, userId: string): Promise<LikeStateResponseDto> {
    await this.ensurePostExists(postId);

    try {
      await this.likesRepository.insert({ postId, userId });
    } catch (error) {
      // Curtir é idempotente: se já existe a curtida (UNIQUE(post,user)), o 23505
      // não é erro — devolve o estado atual.
      if (!this.isUniqueViolation(error)) {
        throw error;
      }
    }

    return this.likeState(postId, userId);
  }

  async unlike(postId: string, userId: string): Promise<LikeStateResponseDto> {
    await this.ensurePostExists(postId);
    await this.likesRepository.delete({ postId, userId });
    return this.likeState(postId, userId);
  }

  async addComment(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.ensurePostExists(postId);

    if (dto.parentId) {
      const parent = await this.commentsRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException('Comentário respondido não encontrado');
      }
      // Só 1 nível: responder a uma resposta não é permitido.
      if (parent.parentId !== null) {
        throw new BadRequestException(
          'Não é possível responder a uma resposta',
        );
      }
    }

    const comment = this.commentsRepository.create({
      postId,
      authorId,
      body: dto.body.trim(),
      parentId: dto.parentId ?? null,
    });
    const saved = await this.commentsRepository.save(comment);

    // Relê com autor para montar a resposta (o create não popula a relação).
    const withAuthor = await this.commentsRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { author: true, replies: { author: true } },
    });
    return CommentResponseDto.fromEntity(withAuthor);
  }

  /**
   * QueryBuilder base do post com autor e subqueries correlacionadas de
   * contagem (curtidas, comentários e — se houver sessão — a curtida do próprio
   * usuário). Os valores são lidos do resultado cru por `hydrateCounts`.
   *
   * Usa subqueries em vez de `loadRelationCountAndMap` porque essa API não
   * existe no TypeORM 1.x.
   */
  private baseQuery(currentUserId?: string): SelectQueryBuilder<Post> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)')
            .from(PostLike, 'pl_count')
            .where('pl_count.post_id = post.id'),
        'likes_count',
      )
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)')
            .from(Comment, 'c_count')
            .where('c_count.post_id = post.id'),
        'comments_count',
      );

    if (currentUserId) {
      qb.addSelect(
        (sub) =>
          sub
            .select('COUNT(*)')
            .from(PostLike, 'pl_me')
            .where('pl_me.post_id = post.id')
            .andWhere('pl_me.user_id = :currentUserId', { currentUserId }),
        'liked_by_me',
      );
    }

    return qb;
  }

  private applySearch(qb: SelectQueryBuilder<Post>, term: string): void {
    // Full-text no lado do banco: a coluna gerada `search_vector` (índice GIN)
    // casa contra a query. `plainto_tsquery` interpreta o texto do usuário como
    // termos AND, sem exigir sintaxe de tsquery.
    qb.andWhere('post.search_vector @@ plainto_tsquery(:config, :term)', {
      config: FTS_CONFIG,
      term,
    });
  }

  private hydrateCounts(
    posts: Post[],
    raw: CountRaw[],
    currentUserId?: string,
  ): void {
    // `getRawAndEntities` mantém entities e raw alinhados por índice (o join com
    // author é 1:1, então não há linhas duplicadas).
    posts.forEach((post, index) => {
      const row = raw[index];
      post.likesCount = Number(row?.likes_count ?? 0);
      post.commentsCount = Number(row?.comments_count ?? 0);
      post.likedByMe = currentUserId ? Number(row?.liked_by_me ?? 0) : 0;
    });
  }

  private async likeState(
    postId: string,
    userId: string,
  ): Promise<LikeStateResponseDto> {
    const [likesCount, myLikes] = await Promise.all([
      this.likesRepository.count({ where: { postId } }),
      this.likesRepository.count({ where: { postId, userId } }),
    ]);
    return { likesCount, likedByMe: myLikes > 0 };
  }

  private async ensurePostExists(postId: string): Promise<void> {
    const count = await this.postsRepository.count({ where: { id: postId } });
    if (count === 0) {
      throw new NotFoundException('Publicação não encontrada');
    }
  }

  private normalizeTags(tags?: string[]): string[] {
    if (!tags) return [];
    // Remove vazios/espaços e duplicatas (case-insensitive), preservando ordem.
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of tags) {
      const tag = raw.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(tag);
    }
    return result;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string } | undefined)?.code ===
        PG_UNIQUE_VIOLATION
    );
  }
}
