import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configuração compartilhada entre `main.ts` e a suíte e2e — os testes precisam
 * subir a app exatamente como produção, senão o ValidationPipe não existe e
 * toda asserção de 400 recebe 201.
 */
export function configureApp(app: INestApplication): void {
  app.enableCors({
    origin: ['http://localhost:5173'], // dev server do vite
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // O token viaja no header, não em cookie. Se um dia virar cookie, isto
    // precisa ser true E o origin precisa continuar sendo lista explícita
    // (wildcard é ilegal junto com credentials).
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Cadastro, autenticação por JWT e perfil do usuário.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Cole o accessToken retornado por POST /auth/login',
      },
      // Este nome precisa bater exatamente com @ApiBearerAuth('access-token'),
      // senão o botão Authorize não anexa o header.
      'access-token',
    )
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });
}
