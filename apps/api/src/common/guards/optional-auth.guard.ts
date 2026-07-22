import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { jwtConstants } from '../../auth/auth.constants';
import type { JwtPayload } from '../../auth/types/jwt-payload';

/**
 * Autenticação *opcional*, para rotas que qualquer um pode ver mas que ficam mais
 * ricas quando há sessão (o feed: visível deslogado, com `likedByMe` quando logado).
 *
 * Ao contrário do `AuthGuard` global (tudo-ou-nada), este nunca lança: se houver
 * um Bearer token válido, anexa o payload em `request.user`; se estiver ausente ou
 * inválido, apenas segue com `request.user` indefinido.
 *
 * Uso: combine com `@Public()` na rota. O guard global roda primeiro e, por ser
 * `@Public()`, libera sem ler o token; depois este guard (aplicado via
 * `@UseGuards(OptionalAuthGuard)`) anexa o usuário quando ele existir.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: jwtConstants.secret,
        });
      } catch {
        // Token inválido/expirado num contexto opcional não é erro: apenas
        // trata como visitante anônimo.
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
