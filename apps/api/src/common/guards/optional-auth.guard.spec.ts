import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/types/jwt-payload';
import { OptionalAuthGuard } from './optional-auth.guard';

describe('OptionalAuthGuard', () => {
  let guard: OptionalAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const payload: JwtPayload = { sub: 'user-1', email: 'ana@example.com' };

  function contextWith(authorization?: string): {
    context: ExecutionContext;
    request: Request & { user?: JwtPayload };
  } {
    const request = {
      headers: authorization ? { authorization } : {},
    } as unknown as Request & { user?: JwtPayload };

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue(payload),
    } as unknown as jest.Mocked<JwtService>;

    guard = new OptionalAuthGuard(jwtService);
  });

  it('libera e anexa o payload quando há token válido', async () => {
    const { context, request } = contextWith('Bearer token-valido');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(payload);
  });

  it('libera como anônimo quando não há header Authorization', async () => {
    const { context, request } = contextWith();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('libera como anônimo (sem lançar) quando o token é inválido', async () => {
    jwtService.verifyAsync.mockRejectedValueOnce(new Error('jwt expired'));
    const { context, request } = contextWith('Bearer token-expirado');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('ignora esquema diferente de Bearer', async () => {
    const { context, request } = contextWith('Basic token-valido');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });
});
