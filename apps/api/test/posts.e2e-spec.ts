import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/setup';
import type { LoginResponseDto } from './../src/auth/dto/login-response.dto';

/**
 * Fluxo ordenado do feed. Requer o Postgres no ar
 * (`docker compose up -d`) com as migrations aplicadas (`pnpm api:migration:run`).
 */
describe('Posts feed (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let postId: string;
  let rootCommentId: string;

  const author = {
    name: 'Julio Silva',
    email: 'julio.e2e@example.com',
    password: 'S3nh4Segura!',
  };

  const newPost = {
    title: 'Full-text search no Postgres com tsvector',
    description: 'Coluna gerada e índice GIN para busca textual.',
    content: "SELECT to_tsvector('portuguese', 'exemplo')",
    tags: ['Postgres', 'SQL'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    // Começa do zero. CASCADE limpa curtidas e comentários junto com os posts.
    await dataSource.query(
      'TRUNCATE TABLE "users", "posts", "post_likes", "comments" RESTART IDENTITY CASCADE',
    );

    await request(app.getHttpServer()).post('/users').send(author).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: author.email, password: author.password })
      .expect(200);
    accessToken = (login.body as LoginResponseDto).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts (público)', () => {
    it('devolve 200 sem token, com feed vazio no início', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(response.body).toMatchObject({ total: 0, page: 1 });
      expect(response.body.items).toEqual([]);
    });
  });

  describe('POST /posts', () => {
    it('exige autenticação (401 sem token)', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send(newPost)
        .expect(401);
    });

    it('cria a publicação com token e devolve contadores zerados', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPost)
        .expect(201);

      expect(response.body).toMatchObject({
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags,
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
        author: { name: author.name },
      });
      expect(response.body.author).not.toHaveProperty('email');
      postId = response.body.id;
    });

    it('rejeita payload inválido (400)', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'x', description: '', content: '' })
        .expect(400);
    });
  });

  describe('GET /posts com busca full-text', () => {
    it('encontra o post por um termo do título', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .query({ search: 'tsvector' })
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.items[0].id).toBe(postId);
    });

    it('devolve vazio para termo sem correspondência', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .query({ search: 'kubernetes' })
        .expect(200);

      expect(response.body.total).toBe(0);
    });
  });

  describe('Curtidas', () => {
    it('curtir exige autenticação (401)', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .expect(401);
    });

    it('curte o post e reflete no estado', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toEqual({ likesCount: 1, likedByMe: true });
    });

    it('curtir de novo é idempotente (continua 1)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.likesCount).toBe(1);
    });

    it('likedByMe fica true para quem está logado no GET', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.likedByMe).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    it('likedByMe fica false para visitante anônimo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200);

      expect(response.body.likedByMe).toBe(false);
    });

    it('descurte e zera o estado', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/posts/${postId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ likesCount: 0, likedByMe: false });
    });
  });

  describe('Comentários', () => {
    it('comentar exige autenticação (401)', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({ body: 'Comentário anônimo' })
        .expect(401);
    });

    it('cria um comentário-raiz', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ body: 'Excelente explicação!' })
        .expect(201);

      expect(response.body).toMatchObject({
        body: 'Excelente explicação!',
        author: { name: author.name },
        replies: [],
      });
      rootCommentId = response.body.id;
    });

    it('cria uma resposta ao comentário-raiz', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ body: 'Obrigado!', parentId: rootCommentId })
        .expect(201);
    });

    it('recusa responder a uma resposta (400)', async () => {
      // Cria a resposta e tenta responder a ela.
      const reply = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ body: 'Uma resposta', parentId: rootCommentId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ body: 'Resposta de resposta', parentId: reply.body.id })
        .expect(400);
    });

    it('o detalhe traz os comentários aninhados e o contador', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200);

      // 1 raiz + 2 respostas = commentsCount 3; 1 comentário-raiz na árvore.
      expect(response.body.commentsCount).toBe(3);
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].replies.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /posts/:id inexistente', () => {
    it('devolve 404 para uuid válido sem post', async () => {
      await request(app.getHttpServer())
        .get('/posts/33333333-3333-3333-3333-333333333333')
        .expect(404);
    });

    it('devolve 400 para id que não é uuid', async () => {
      await request(app.getHttpServer()).get('/posts/nao-e-uuid').expect(400);
    });
  });
});
