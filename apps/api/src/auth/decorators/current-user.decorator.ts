import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload';

/**
 * Extrai o payload do JWT que o guard anexou ao request.
 *
 * O retorno é `JwtPayload | undefined`: em rotas protegidas pelo `AuthGuard` o
 * usuário está sempre presente, mas em rotas de auth opcional
 * (`OptionalAuthGuard`) pode não haver sessão. Handlers de rota protegida podem
 * anotar o parâmetro como `JwtPayload` sem problema; os de rota opcional devem
 * tratar o `undefined`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    return request.user;
  },
);
