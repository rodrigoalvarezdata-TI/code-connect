import { ConflictException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import type { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { PG_UNIQUE_VIOLATION } from './users.constants';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const validDto: RegisterUserDto = {
    name: 'Ana Souza',
    email: 'ana@example.com',
    password: 'S3nh4Segura!',
  };

  /** Erro que o driver do Postgres lança ao bater na constraint UNIQUE. */
  function uniqueViolation(): QueryFailedError {
    const driverError = Object.assign(new Error('duplicate key value'), {
      code: PG_UNIQUE_VIOLATION,
    });
    return new QueryFailedError('INSERT INTO users', [], driverError);
  }

  beforeEach(() => {
    repository = {
      // O `create` do TypeORM é síncrono e só instancia a entidade a partir do
      // literal — devolver o próprio literal reproduz isso fielmente.
      create: jest.fn((data: Partial<User>) => data as User),
      save: jest.fn((user: User) => Promise.resolve(user)),
      findOne: jest.fn(() => Promise.resolve(null)),
    } as unknown as jest.Mocked<Repository<User>>;

    service = new UsersService(repository);
  });

  describe('create', () => {
    it('armazena o hash da senha, nunca o texto puro', async () => {
      const user = await service.create(validDto);

      expect(user.passwordHash).not.toBe(validDto.password);
      await expect(compare(validDto.password, user.passwordHash)).resolves.toBe(
        true,
      );
      await expect(compare('senha-errada', user.passwordHash)).resolves.toBe(
        false,
      );
    });

    it('normaliza o e-mail para minúsculas e sem espaços', async () => {
      const user = await service.create({
        ...validDto,
        email: '  Ana@Example.COM  ',
      });

      expect(user.email).toBe('ana@example.com');
    });

    it('faz trim do nome', async () => {
      const user = await service.create({ ...validDto, name: '  Ana Souza  ' });

      expect(user.name).toBe('Ana Souza');
    });

    it('não define id nem createdAt — quem gera é o banco', async () => {
      await service.create(validDto);

      const persisted = repository.create.mock.calls[0][0];
      expect(persisted).not.toHaveProperty('id');
      expect(persisted).not.toHaveProperty('createdAt');
    });

    it('traduz a violação de unicidade do Postgres em 409', async () => {
      repository.save.mockRejectedValueOnce(uniqueViolation());

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
    });

    it('propaga erros de banco que não sejam de unicidade', async () => {
      // Regressão: engolir qualquer falha como 409 esconderia uma queda de
      // conexão atrás de "e-mail já cadastrado".
      const outage = new Error('connection terminated');
      repository.save.mockRejectedValueOnce(outage);

      await expect(service.create(validDto)).rejects.toThrow(outage);
    });
  });

  describe('findByEmail', () => {
    it('normaliza o e-mail antes de consultar', async () => {
      await service.findByEmail('  ANA@example.COM ');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'ana@example.com' },
      });
    });

    it('retorna null para e-mail desconhecido', async () => {
      await expect(
        service.findByEmail('ninguem@example.com'),
      ).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('consulta pelo id', async () => {
      await service.findById('user-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('retorna null para id desconhecido', async () => {
      await expect(service.findById('id-inexistente')).resolves.toBeNull();
    });
  });
});
