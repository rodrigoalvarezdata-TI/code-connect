import { UnauthorizedException } from '@nestjs/common';
import type { JwtPayload } from '../auth/types/jwt-payload';
import type { RegisterUserDto } from './dto/register-user.dto';
import type { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const user: User = {
    id: 'user-1',
    name: 'Ana Souza',
    email: 'ana@example.com',
    passwordHash: 'hash-secreto',
    createdAt: new Date('2026-07-21T14:32:00.000Z'),
  };

  const payload: JwtPayload = { sub: user.id, email: user.email };

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    usersService.create.mockResolvedValue(user);
    usersService.findById.mockResolvedValue(user);

    controller = new UsersController(usersService);
  });

  describe('register', () => {
    const dto: RegisterUserDto = {
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'S3nh4Segura!',
    };

    it('delega para o service e devolve o DTO de resposta', async () => {
      const result = await controller.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: '2026-07-21T14:32:00.000Z',
      });
    });

    it('nunca devolve o passwordHash', async () => {
      const result = await controller.register(dto);

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('getMe', () => {
    it('busca o usuário pelo sub do token', async () => {
      const result = await controller.getMe(payload);

      expect(usersService.findById).toHaveBeenCalledWith(user.id);
      expect(result.email).toBe(user.email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('responde 401 quando o usuário do token não existe mais', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(controller.getMe(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
