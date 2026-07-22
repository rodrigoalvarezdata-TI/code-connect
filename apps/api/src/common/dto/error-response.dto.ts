import { ApiProperty } from '@nestjs/swagger';

/**
 * Formato padrão de erro do Nest para HttpExceptions lançadas manualmente
 * (401, 404, 409...), onde `message` é uma string única.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Credenciais inválidas' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}
