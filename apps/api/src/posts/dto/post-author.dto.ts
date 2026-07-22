import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../../users/entities/user.entity';

/** Recorte público do autor exibido em posts e comentários (sem e-mail). */
export class PostAuthorDto {
  @ApiProperty({
    format: 'uuid',
    example: '9b1c3f0e-2a4d-4f8b-9c1e-7d5a6b8c0e12',
  })
  id: string;

  @ApiProperty({ example: 'Julio Silva' })
  name: string;

  static fromEntity(user: User): PostAuthorDto {
    const dto = new PostAuthorDto();
    dto.id = user.id;
    dto.name = user.name;
    return dto;
  }
}
