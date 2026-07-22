/** Custo do bcrypt. ~60-100ms por hash em JS puro. */
export const SALT_ROUNDS = 10;

/** bcrypt trunca silenciosamente a senha além disso, então rejeitamos antes. */
export const MAX_PASSWORD_LENGTH = 72;

export const MIN_PASSWORD_LENGTH = 8;

/**
 * `unique_violation` do Postgres. É o sinal de que o INSERT bateu na constraint
 * UNIQUE de `users.email`, e é como o cadastro duplicado é detectado.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_UNIQUE_VIOLATION = '23505';
