import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ValidationErrorResponseDto } from '../common/dto/validation-error-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastra um novo usuário',
    description:
      'Endpoint público. O e-mail deve ser único (comparação case-insensitive).',
  })
  @ApiCreatedResponse({ description: 'Usuário criado', type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Payload inválido',
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado',
    type: ErrorResponseDto,
  })
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  // Precisa vir antes de qualquer @Get(':id') futuro, senão a rota
  // parametrizada engole o /me.
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiOkResponse({ description: 'Usuário autenticado', type: UserResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido ou expirado',
    type: ErrorResponseDto,
  })
  async getMe(@CurrentUser() payload: JwtPayload): Promise<UserResponseDto> {
    // Relê o banco em vez de ecoar o token: o token é uma afirmação feita no
    // login, o banco é a verdade atual (divergem assim que o usuário muda).
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      // 401 e não 404: o token referencia um subject que não existe mais,
      // o que é falha de autenticação, não recurso ausente.
      throw new UnauthorizedException('Usuário do token não existe mais');
    }

    return UserResponseDto.fromEntity(user);
  }
}
