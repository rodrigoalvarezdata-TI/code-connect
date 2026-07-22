import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { Comment } from '../posts/entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { User } from '../users/entities/user.entity';

/**
 * Fonte única das opções de conexão: consumida tanto pelo `TypeOrmModule` que
 * sobe com a aplicação quanto pelo `data-source.ts` que a CLI de migrations
 * usa. Se os dois divergirem, a migration roda contra um banco e a aplicação
 * contra outro — e a falha só aparece em runtime.
 */
export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'code_conect',
    password: process.env.POSTGRES_PASSWORD ?? 'code_conect',
    database: process.env.POSTGRES_DB ?? 'code_conect',

    // Faz o `@PrimaryGeneratedColumn('uuid')` gerar DEFAULT gen_random_uuid()
    // em vez de uuid_generate_v4(). O default do TypeORM é a extensão
    // uuid-ossp, que ele tenta criar a cada conexão — e CREATE EXTENSION exige
    // privilégio que o usuário da aplicação normalmente não tem em Postgres
    // gerenciado. gen_random_uuid() é núcleo desde o Postgres 13.
    uuidExtension: 'pgcrypto',

    entities: [User, Post, PostLike, Comment],

    // Listadas explicitamente em vez de por glob: com glob a build compila
    // para `dist` e o caminho `src/**/*.ts` deixa de casar em produção.
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],

    // NUNCA true. `synchronize` deixa o TypeORM alterar o schema sozinho para
    // casar com as entidades, e a "alteração" que ele escolhe para uma coluna
    // renomeada é DROP + ADD — ou seja, perda silenciosa de dados. O schema só
    // muda por migration versionada.
    synchronize: false,

    // Idem: migrations rodam por comando explícito (`pnpm api:migration:run`),
    // não como efeito colateral de subir a aplicação.
    migrationsRun: false,

    ssl:
      process.env.POSTGRES_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  };
}
