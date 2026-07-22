/**
 * Limites de tamanho e configuração da feature de posts. Centralizados aqui para
 * que DTOs (validação) e Swagger fiquem em sintonia — como `users.constants.ts`.
 */
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_CONTENT_LENGTH = 10000;
export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 30;
export const MAX_COMMENT_LENGTH = 1000;

/** Paginação do feed. `enableImplicitConversion` está off, então os DTOs de query
 * precisam de `@Type(() => Number)` para receber esses valores como número. */
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

/**
 * Dicionário do full-text search. O conteúdo do app é em pt-BR, então o vetor e a
 * query usam a configuração 'portuguese' (stemming/stopwords em português).
 */
export const FTS_CONFIG = 'portuguese';

/**
 * `unique_violation` do Postgres — mesma constante usada em `users`. Sinaliza que
 * o INSERT em `post_likes` bateu na UNIQUE(post_id, user_id): o usuário já curtiu.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_UNIQUE_VIOLATION = '23505';
