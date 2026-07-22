import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '9b1c3f0e-2a4d-4f8b-9c1e-7d5a6b8c0e12',
  })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ format: 'email', example: 'ana@example.com' })
  email: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-21T14:32:00.000Z' })
  createdAt: string;

  /**
   * Único caminho de `User` para a resposta HTTP. O mapeamento é explícito
   * campo a campo, de modo que o `passwordHash` fica de fora por construção
   * e não por lembrar de removê-lo.
   */
  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();
    return dto;
  }
}
