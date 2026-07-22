import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Representação interna do usuário. Nunca é serializada diretamente:
 * a única saída para a resposta HTTP é `UserResponseDto.fromEntity`,
 * que não copia o `passwordHash`.
 *
 * Só campos de dados, sem métodos — assim a classe continua estruturalmente
 * compatível com objetos literais e os testes podem montar um `User` sem
 * instanciar a entidade.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  /**
   * Sempre armazenado normalizado (trim + lowercase) — a normalização é feita
   * no service. O índice único é `UNIQUE(email)` simples justamente por isso:
   * como o valor gravado já é minúsculo, a unicidade fica case-insensitive na
   * prática sem precisar de um índice funcional sobre `lower(email)`.
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /** bcrypt sempre produz 60 caracteres. */
  @Column({ type: 'varchar', length: 60, name: 'password_hash' })
  passwordHash: string;

  // timestamptz e não timestamp: sem timezone o Postgres grava o horário
  // "nu" e a reconstrução depende do fuso de quem lê.
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
