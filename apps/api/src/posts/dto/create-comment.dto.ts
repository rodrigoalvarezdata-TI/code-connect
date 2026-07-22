import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { MAX_COMMENT_LENGTH } from '../posts.constants';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Texto do comentário.',
    example: 'Achei muito bom seu código, parabéns!',
    maxLength: MAX_COMMENT_LENGTH,
  })
  @IsString()
  @Length(1, MAX_COMMENT_LENGTH)
  body: string;

  @ApiPropertyOptional({
    description:
      'ID do comentário-raiz ao responder. Só é permitido 1 nível: não se ' +
      'pode responder a uma resposta.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
