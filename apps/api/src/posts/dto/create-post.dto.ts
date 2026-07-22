import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import {
  MAX_CONTENT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
} from '../posts.constants';

export class CreatePostDto {
  @ApiProperty({
    description: 'Título do post.',
    example: 'Como criar hooks reutilizáveis no React',
    minLength: MIN_TITLE_LENGTH,
    maxLength: MAX_TITLE_LENGTH,
  })
  @IsString()
  @Length(MIN_TITLE_LENGTH, MAX_TITLE_LENGTH)
  title: string;

  @ApiProperty({
    description: 'Descrição/resumo do post.',
    example: 'Um guia prático sobre extrair lógica para custom hooks.',
    maxLength: MAX_DESCRIPTION_LENGTH,
  })
  @IsString()
  @Length(1, MAX_DESCRIPTION_LENGTH)
  description: string;

  @ApiProperty({
    description: 'Trecho de código exibido no bloco "Código:".',
    example: "const useToggle = () => { /* ... */ }",
    maxLength: MAX_CONTENT_LENGTH,
  })
  @IsString()
  @Length(1, MAX_CONTENT_LENGTH)
  content: string;

  @ApiPropertyOptional({
    description: 'Tags do post (até 5).',
    example: ['React', 'Hooks'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TAGS)
  @IsString({ each: true })
  @MaxLength(MAX_TAG_LENGTH, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description:
      'URL da miniatura. Se ausente, o frontend renderiza um placeholder.',
    example: 'https://picsum.photos/seed/react/960/540',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  thumbnailUrl?: string;
}
