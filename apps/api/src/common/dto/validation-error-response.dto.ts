import { ApiProperty } from '@nestjs/swagger';

/**
 * Formato de erro do ValidationPipe: diferente das demais HttpExceptions,
 * `message` é um array com uma entrada por constraint violada.
 */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: [
      'email must be an email',
      'password must be longer than or equal to 8 characters',
    ],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
