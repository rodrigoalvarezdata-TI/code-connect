import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const dto: LoginDto = { email: 'ana@example.com', password: 'S3nh4Segura!' };

  const response: LoginResponseDto = {
    accessToken: 'token-assinado',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: 'user-1',
      name: 'Ana Souza',
      email: 'ana@example.com',
      createdAt: '2026-07-21T14:32:00.000Z',
    },
  };

  beforeEach(() => {
    authService = { login: jest.fn() } as unknown as jest.Mocked<AuthService>;
    authService.login.mockResolvedValue(response);

    controller = new AuthController(authService);
  });

  it('delega o login para o service', async () => {
    await expect(controller.login(dto)).resolves.toBe(response);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
