import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import type { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { PG_UNIQUE_VIOLATION, SALT_ROUNDS } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: RegisterUserDto): Promise<User> {
    const user = this.usersRepository.create({
      name: dto.name.trim(),
      email: this.normalizeEmail(dto.email),
      passwordHash: await hash(dto.password, SALT_ROUNDS),
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      // Sem SELECT prévio de propósito: a checagem "existe?" antes do INSERT
      // não fecha a corrida — dois requests podem ler "não existe" e inserir
      // os dois. A constraint UNIQUE é o único ponto que decide, e ela decide
      // mesmo com várias instâncias da API rodando em paralelo (o que a versão
      // em memória, com sua re-checagem dentro do processo, não conseguia).
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: this.normalizeEmail(email) },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string } | undefined)?.code ===
        PG_UNIQUE_VIOLATION
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
