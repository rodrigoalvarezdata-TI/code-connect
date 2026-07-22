import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import type { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let user: User;

  const password = 'S3nh4Segura!';

  beforeEach(async () => {
    user = {
      id: 'user-1',
      name: 'Ana Souza',
      email: 'ana@example.com',
      passwordHash: await hash(password, 10),
      createdAt: new Date('2026-07-21T14:32:00.000Z'),
    };

    // Cast único na fronteira, para não repetir em cada call site.
    usersService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    jwtService = { signAsync: jest.fn() } as unknown as jest.Mocked<JwtService>;

    usersService.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('token-assinado');

    service = new AuthService(usersService, jwtService);
  });

  it('retorna o token e o usuário quando as credenciais são válidas', async () => {
    const result = await service.login({ email: user.email, password });

    expect(result.accessToken).toBe('token-assinado');
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    expect(result.user.email).toBe(user.email);
  });

  it('nunca expõe o passwordHash na resposta', async () => {
    const result = await service.login({ email: user.email, password });

    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('assina o payload com exatamente sub e email', async () => {
    await service.login({ email: user.email, password });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
  });

  it('rejeita e-mail desconhecido', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ninguem@example.com', password }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita senha incorreta', async () => {
    await expect(
      service.login({ email: user.email, password: 'senha-errada' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('usa a mesma mensagem para e-mail desconhecido e senha errada', async () => {
    // Regressão contra enumeração de usuários: mensagens distintas
    // transformariam o login em um oráculo.
    const wrongPassword = await service
      .login({ email: user.email, password: 'senha-errada' })
      .catch((error: Error) => error.message);

    usersService.findByEmail.mockResolvedValue(null);
    const unknownEmail = await service
      .login({ email: 'ninguem@example.com', password })
      .catch((error: Error) => error.message);

    expect(wrongPassword).toBe(unknownEmail);
  });

  it('não assina token quando a autenticação falha', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'x@example.com', password }),
    ).rejects.toThrow();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
