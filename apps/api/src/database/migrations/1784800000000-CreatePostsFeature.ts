import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cria as tabelas da feature de feed: `posts`, `post_likes` e `comments`.
 *
 * Escrita à mão em SQL cru (e não gerada) por causa da coluna `search_vector`:
 * é um `tsvector` GERADO (`GENERATED ALWAYS AS ... STORED`) que o TypeORM 1.1 não
 * sabe modelar. O índice GIN sobre ela é o que faz o full-text search escalar.
 */
export class CreatePostsFeature1784800000000 implements MigrationInterface {
  name = 'CreatePostsFeature1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // `array_to_string` é STABLE (não IMMUTABLE), então não pode entrar direto na
    // expressão de uma coluna gerada. Este wrapper é determinístico para um
    // text[] de entrada, então declará-lo IMMUTABLE é seguro — é o que permite
    // incluir as tags no `search_vector`.
    await queryRunner.query(`
      CREATE FUNCTION posts_tags_to_text(text[]) RETURNS text
        LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
        $$ SELECT array_to_string($1, ' ') $$
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(120) NOT NULL,
        "description" text NOT NULL,
        "content" text NOT NULL,
        "thumbnail_url" character varying(500),
        "tags" text array NOT NULL DEFAULT '{}',
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "search_vector" tsvector GENERATED ALWAYS AS (
          to_tsvector(
            'portuguese',
            coalesce("title", '') || ' ' ||
            coalesce("description", '') || ' ' ||
            coalesce("content", '') || ' ' ||
            posts_tags_to_text("tags")
          )
        ) STORED,
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("author_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_search_vector" ON "posts" USING GIN ("search_vector")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_created_at" ON "posts" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_post_likes_post_user" UNIQUE ("post_id", "user_id"),
        CONSTRAINT "FK_post_likes_post" FOREIGN KEY ("post_id")
          REFERENCES "posts" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_likes_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_post_likes_post" ON "post_likes" ("post_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "body" text NOT NULL,
        "parent_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id")
          REFERENCES "posts" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_parent" FOREIGN KEY ("parent_id")
          REFERENCES "comments" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_post" ON "comments" ("post_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_parent" ON "comments" ("parent_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ordem inversa; os índices caem junto com as tabelas.
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS posts_tags_to_text(text[])`);
  }
}
