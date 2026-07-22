import { join } from 'node:path';

/**
 * Carrega o `.env` da raiz do monorepo (o mesmo que o docker-compose lê), de
 * modo que credencial de banco fique declarada em um lugar só.
 *
 * Usa `process.loadEnvFile` do Node em vez de dotenv: é nativo desde o Node
 * 20.12, e o dotenv só existe aqui como dependência transitiva do
 * @nestjs/config — sob pnpm ele não é resolvível a partir da raiz do app.
 *
 * Não sobrescreve variáveis já presentes no ambiente, então um valor exportado
 * no shell (ou injetado pelo orquestrador em produção) continua vencendo.
 */
export function loadRootEnv(): void {
  try {
    process.loadEnvFile(join(__dirname, '..', '..', '..', '..', '.env'));
  } catch {
    // Sem .env em disco não é erro: em produção as variáveis vêm do ambiente,
    // e os defaults de `buildDataSourceOptions` cobrem o local.
  }
}
