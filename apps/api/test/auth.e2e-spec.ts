import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/setup';
import type { LoginResponseDto } from './../src/auth/dto/login-response.dto';
import type { ValidationErrorResponseDto } from './../src/common/dto/validation-error-response.dto';

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;

  const credentials = {
    name: 'Ana Souza',
    email: 'ana@example.com',
    password: 'S3nh4Segura!',
  };

  // beforeAll e não beforeEach: o cenário abaixo é um fluxo ordenado que
  // depende do usuário cadastrado no primeiro teste.
  //
  // Requer o Postgres no ar (`docker compose up -d`) com as migrations
  // aplicadas (`pnpm api:migration:run`).
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Sem isto a app sobe sem ValidationPipe e todo 400 esperado vira 201.
    configureApp(app);
    await app.init();

    // Agora que os dados persistem entre execuções, a suíte precisa começar do
    // zero: sem isto o primeiro POST /users devolveria 409 já na segunda
    // execução, por causa do usuário deixado pela primeira.
    //
    // CASCADE porque `posts` (e, por tabela, `post_likes`/`comments`) referencia
    // `users` por FK — sem ele o TRUNCATE falha assim que a feature de feed existe.
    dataSource = app.get(DataSource);
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('cadastra o usuário e devolve 201 sem o passwordHash', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(credentials)
        .expect(201);

      expect(response.body).toMatchObject({
        name: credentials.name,
        email: credentials.email,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('devolve 409 para e-mail já cadastrado, ignorando a caixa', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ ...credentials, email: 'ANA@Example.com' })
        .expect(409);
    });

    it('devolve 400 com lista de erros para payload inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'A', email: 'nao-e-email', password: '123' })
        .expect(400);

      const body = response.body as ValidationErrorResponseDto;
      expect(Array.isArray(body.message)).toBe(true);
    });

    it('devolve 400 para propriedade desconhecida (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ ...credentials, email: 'outro@example.com', isAdmin: true })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('devolve 200 com accessToken para credenciais válidas', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: credentials.email, password: credentials.password })
        .expect(200);

      expect(response.body).toMatchObject({
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
      const body = response.body as LoginResponseDto;
      expect(typeof body.accessToken).toBe('string');
      expect(body.user).not.toHaveProperty('passwordHash');

      accessToken = body.accessToken;
    });

    it('devolve 401 para senha incorreta', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: credentials.email, password: 'senha-errada' })
        .expect(401);
    });

    it('devolve 401 para e-mail desconhecido', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ninguem@example.com', password: credentials.password })
        .expect(401);
    });
  });

  describe('GET /users/me', () => {
    it('devolve os dados do usuário autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: credentials.name,
        email: credentials.email,
      });
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('devolve 401 sem header Authorization', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('devolve 401 para token inválido', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);
    });

    it('devolve 401 para esquema de autenticação diferente de Bearer', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Basic ${accessToken}`)
        .expect(401);
    });
  });
});
