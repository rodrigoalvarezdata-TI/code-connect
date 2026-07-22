import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description:
      'JWT assinado (HS256). Envie como `Authorization: Bearer <token>`.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Validade do token em segundos', example: 3600 })
  expiresIn: number;

  @ApiProperty({
    type: UserResponseDto,
    description:
      'Dados do usuário autenticado, para evitar um round-trip logo após o login',
  })
  user: UserResponseDto;
}
