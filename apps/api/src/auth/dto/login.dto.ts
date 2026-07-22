import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  @IsEmail()
  email: string;

  // Sem @MinLength aqui de propósito: a política de senha pertence ao
  // cadastro. Replicá-la no login vazaria a política e quebraria qualquer
  // credencial legada que não a satisfaça.
  @ApiProperty({ example: 'S3nh4Segura!', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}
