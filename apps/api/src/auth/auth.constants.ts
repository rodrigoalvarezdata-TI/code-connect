/**
 * O fallback é deliberadamente óbvio para nunca ser confundido com um segredo
 * real em um diff. `main.ts` recusa subir em produção sem JWT_SECRET definido.
 */
export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
  expiresIn: '1h',
  expiresInSeconds: 3600,
} as const;
