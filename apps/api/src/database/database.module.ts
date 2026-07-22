import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source.options';
import { loadRootEnv } from './load-root-env';

/**
 * Conexão única com o Postgres, compartilhada por toda a aplicação.
 * Os módulos de domínio não importam este módulo: pedem seus repositórios via
 * `TypeOrmModule.forFeature([...])`, que se liga a esta conexão global.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        loadRootEnv();
        return buildDataSourceOptions();
      },
    }),
  ],
})
export class DatabaseModule {}
