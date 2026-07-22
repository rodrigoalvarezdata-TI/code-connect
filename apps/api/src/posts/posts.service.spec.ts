import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostsService } from './posts.service';
import { PG_UNIQUE_VIOLATION } from './posts.constants';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: jest.Mocked<Repository<Post>>;
  let likesRepository: jest.Mocked<Repository<PostLike>>;
  let commentsRepository: jest.Mocked<Repository<Comment>>;

  const postId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  function uniqueViolation(): QueryFailedError {
    const driverError = Object.assign(new Error('duplicate key value'), {
      code: PG_UNIQUE_VIOLATION,
    });
    return new QueryFailedError('INSERT INTO post_likes', [], driverError);
  }

  beforeEach(() => {
    postsRepository = {
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn((data: Partial<Post>) => data as Post),
      save: jest.fn((post: Post) => Promise.resolve(post)),
    } as unknown as jest.Mocked<Repository<Post>>;

    likesRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<Repository<PostLike>>;

    commentsRepository = {
      create: jest.fn((data: Partial<Comment>) => data as Comment),
      save: jest.fn((c: Comment) => Promise.resolve({ ...c, id: 'c-new' })),
      findOne: jest.fn().mockResolvedValue(null),
      findOneOrFail: jest.fn(),
    } as unknown as jest.Mocked<Repository<Comment>>;

    service = new PostsService(
      postsRepository,
      likesRepository,
      commentsRepository,
    );
  });

  describe('like', () => {
    it('insere a curtida e devolve o estado atualizado', async () => {
      likesRepository.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // do usuário

      await expect(service.like(postId, userId)).resolves.toEqual({
        likesCount: 1,
        likedByMe: true,
      });
      expect(likesRepository.insert).toHaveBeenCalledWith({ postId, userId });
    });

    it('é idempotente: engole o 23505 de curtida já existente', async () => {
      likesRepository.insert.mockRejectedValueOnce(uniqueViolation());
      likesRepository.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      await expect(service.like(postId, userId)).resolves.toEqual({
        likesCount: 1,
        likedByMe: true,
      });
    });

    it('propaga erros de banco que não sejam de unicidade', async () => {
      const outage = new Error('connection terminated');
      likesRepository.insert.mockRejectedValueOnce(outage);

      await expect(service.like(postId, userId)).rejects.toThrow(outage);
    });

    it('devolve 404 quando o post não existe', async () => {
      postsRepository.count.mockResolvedValueOnce(0);

      await expect(service.like(postId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(likesRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe('unlike', () => {
    it('remove a curtida e devolve o estado zerado', async () => {
      likesRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      await expect(service.unlike(postId, userId)).resolves.toEqual({
        likesCount: 0,
        likedByMe: false,
      });
      expect(likesRepository.delete).toHaveBeenCalledWith({ postId, userId });
    });
  });

  describe('addComment', () => {
    const rootDto: CreateCommentDto = { body: 'Muito bom!' };

    it('cria um comentário-raiz e devolve o DTO com autor', async () => {
      commentsRepository.findOneOrFail.mockResolvedValue({
        id: 'c-new',
        body: 'Muito bom!',
        createdAt: new Date('2026-07-22T10:00:00.000Z'),
        author: { id: userId, name: 'Ana' },
        replies: [],
      } as unknown as Comment);

      const result = await service.addComment(postId, userId, rootDto);

      expect(result).toMatchObject({
        id: 'c-new',
        body: 'Muito bom!',
        author: { id: userId, name: 'Ana' },
        replies: [],
      });
    });

    it('devolve 404 quando o post não existe', async () => {
      postsRepository.count.mockResolvedValueOnce(0);

      await expect(
        service.addComment(postId, userId, rootDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('devolve 404 quando o comentário-pai não existe', async () => {
      commentsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.addComment(postId, userId, { body: 'oi', parentId: 'p-x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devolve 404 quando o pai pertence a outro post', async () => {
      commentsRepository.findOne.mockResolvedValueOnce({
        id: 'p-1',
        postId: 'outro-post',
        parentId: null,
      } as unknown as Comment);

      await expect(
        service.addComment(postId, userId, { body: 'oi', parentId: 'p-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('recusa responder a uma resposta (mais de 1 nível)', async () => {
      commentsRepository.findOne.mockResolvedValueOnce({
        id: 'p-1',
        postId,
        parentId: 'raiz',
      } as unknown as Comment);

      await expect(
        service.addComment(postId, userId, { body: 'oi', parentId: 'p-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
