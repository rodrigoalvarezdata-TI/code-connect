import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Public() é obrigatório: o AuthGuard está registrado via APP_GUARD e vale
  // para a aplicação inteira, então sem isto a raiz responderia 401.
  @Public()
  @Get()
  // Fora do Swagger de propósito: não é um recurso da API, e listá-lo junto
  // de /users e /auth/login sugeriria que faz parte do contrato.
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }
}
