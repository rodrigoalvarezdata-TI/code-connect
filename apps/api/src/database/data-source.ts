import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source.options';
import { loadRootEnv } from './load-root-env';

// A CLI do TypeORM roda fora do Nest, então o ConfigModule não existe aqui e
// o .env precisa ser carregado à mão antes de montar as opções.
loadRootEnv();

/**
 * Export default exigido pela CLI do TypeORM (`typeorm -d <arquivo>`).
 * Usado só pelos comandos de migration — a aplicação monta sua conexão pelo
 * `DatabaseModule`, a partir das mesmas opções.
 */
export default new DataSource(buildDataSourceOptions());
