import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './auth.constants';
import type { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';
import type { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = user
      ? await compare(dto.password, user.passwordHash)
      : false;

    // Mesma exceção e mesma mensagem para "e-mail inexistente" e "senha
    // errada": distingui-las transformaria o login em um oráculo de
    // enumeração de usuários.
    //
    // Nota: quando o e-mail é desconhecido pulamos o compare(), então essa
    // resposta é mensuravelmente mais rápida — um oráculo de timing residual.
    // Fechá-lo exigiria comparar contra um hash dummy fixo; omitido aqui de
    // forma consciente.
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: jwtConstants.expiresInSeconds,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
