# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Estrutura do repositório

Monorepo com workspaces pnpm e dois apps independentes:

- `apps/api` — backend NestJS (plataforma Express), TypeScript, Jest nos testes.
- `apps/web` — frontend React 19 + Vite, TypeScript, oxlint para lint.

Ainda não existe pacote compartilhado entre os dois. A ligação entre eles é feita pelo frontend: `apps/web` fala com `apps/api` por um cliente axios (`src/lib/http.ts`, base em `VITE_API_URL`), com serviços em `src/services/`. Não há proxy no dev server do Vite — o CORS da API libera a origem do front.

Os dois apps já têm estrutura real:
- `apps/api` tem autenticação (JWT), módulo de usuários e a **feature de feed de posts** (posts, curtidas, comentários e busca full-text). Siga as convenções REST abaixo ao adicionar endpoints.
- `apps/web` tem rotas react-router em `App.tsx`, árvore de componentes em atomic design sob `src/components/`, design tokens do Tailwind v4, e uma suíte Vitest + Testing Library com auditoria de acessibilidade via axe-core. Siga os padrões já existentes aqui.

## Comandos

Todos rodam a partir da raiz do repo pelos scripts do `package.json`, ou com `pnpm --filter <api|web> <script>` / entrando na pasta do app.

Atalhos da raiz:
```
pnpm dev              # sobe api e web (dev servers) em paralelo
pnpm api:dev          # nest start --watch (apps/api)
pnpm web:dev          # vite dev server (apps/web)
pnpm api:build        # nest build
pnpm web:build        # tsc -b && vite build
pnpm api:lint         # eslint --fix em apps/api
pnpm web:lint         # oxlint em apps/web
pnpm api:test         # testes unitários (jest) de apps/api
pnpm web:test         # vitest run (passada única) em apps/web
pnpm web:test:a11y    # auditoria de acessibilidade (axe-core) em apps/web

pnpm db:up            # docker compose up -d (postgres)
pnpm db:down          # para o postgres, mantendo o volume
pnpm db:psql          # abre um psql no container em execução
pnpm api:migration:run      # aplica as migrations pendentes
pnpm api:migration:generate src/database/migrations/<Nome>
pnpm api:migration:revert   # desfaz a última migration
pnpm api:seed         # popula o banco com posts/usuários mockados
pnpm api:test:e2e     # suíte e2e (precisa do postgres no ar + migrations aplicadas)
```

Dentro de `apps/api`:
```
pnpm test                  # testes unitários (jest, *.spec.ts, rootDir: src)
pnpm test:watch
pnpm test:cov
pnpm test:e2e               # jest --config ./test/jest-e2e.json
pnpm test -- app.controller # roda um arquivo/padrão de teste (passthrough do jest)
pnpm seed                  # ts-node src/database/seed.ts
pnpm start:debug             # nest start --debug --watch
```

Dentro de `apps/web`:
```
pnpm dev        # vite
pnpm build      # tsc -b && vite build (checa tipos via project references e empacota)
pnpm lint       # oxlint
pnpm preview    # preview do build de produção
pnpm test       # vitest (modo watch)
pnpm test:run   # vitest run (passada única — use em CI/scripts)
pnpm test:a11y  # só a auditoria de acessibilidade (axe-core)
```

Atenção: `pnpm test` sobe um servidor em modo watch que nunca encerra — use sempre `test:run` quando precisar de um resultado de passada única.

## Notas de arquitetura

**apps/api (NestJS)**
- Estrutura padrão Nest (module/controller/service) sob `apps/api/src`, iniciada em `main.ts` via `NestFactory.create(AppModule)`, escutando em `process.env.PORT ?? 3000`. `AppModule` importa `DatabaseModule`, `UsersModule`, `AuthModule` e `PostsModule`.
- `nest-cli.json` define `sourceRoot: src`; o build sai em `dist`.
- A config do Jest fica inline no `apps/api/package.json` (não há arquivo jest.config separado): `rootDir` é `src`, testes casam `*.spec.ts`, e os e2e vivem em `apps/api/test` com o próprio `jest-e2e.json`.
- O ESLint (`apps/api/eslint.config.mjs`) usa flat config com `typescript-eslint` recommendedTypeChecked + integração com o prettier. Regras relaxadas de nota: `no-explicit-any` off, `no-floating-promises` e `no-unsafe-argument` como warning, não erro.
- O tsconfig mira ES2023, usa decorators/metadata (necessário para a DI do Nest) e `noImplicitAny: false`.

### Persistência (apps/api)

**Postgres 17 via TypeORM.** O banco sobe pelo `docker-compose.yml` na raiz, num volume nomeado (`postgres-data`) para os dados sobreviverem ao `docker compose down` — só `down -v` apaga tudo. As credenciais vêm de um `.env` na raiz (copie de `.env.example`), lido tanto pelo compose quanto pela API.

Setup na primeira vez, e depois de qualquer pull que adicione migration:
```
cp .env.example .env    # uma vez
pnpm db:up
pnpm api:migration:run
pnpm api:seed           # opcional: dados mockados para desenvolver
```

- **A config de conexão tem uma fonte só**: `src/database/data-source.options.ts`. Tanto o `DatabaseModule` (a aplicação) quanto `src/database/data-source.ts` (a CLI do TypeORM) partem dela. Nunca deixe as duas divergirem — as migrations rodariam contra um banco e a aplicação contra outro.
- **`synchronize` está off e continua off.** Mudança de schema passa por migration versionada em `src/database/migrations/`. `synchronize: true` resolve uma coluna renomeada como DROP + ADD, ou seja, perda silenciosa de dados.
- **`migrationsRun` também está off** — migrations rodam por comando explícito, não como efeito colateral de subir a aplicação.
- **Unicidade é imposta pelo banco, não por um `SELECT` prévio.** `users.email` tem constraint UNIQUE, e `post_likes` tem `UNIQUE(post_id, user_id)`. Os services inserem e traduzem o erro `23505` do Postgres em `ConflictException` (usuário) ou tratam como idempotente (curtida). Um check-then-insert tem corrida entre os dois passos que nenhuma quantidade de código de aplicação fecha quando há mais de uma instância rodando.
- **Entidades são registradas explicitamente** em `entities: [User, Post, PostLike, Comment]`, não por glob — um glob `src/**/*.ts` para de casar quando o build emite para `dist`. Toda entidade nova precisa entrar nesse array.
- `uuidExtension: 'pgcrypto'` faz os UUIDs gerados usarem o `gen_random_uuid()` do núcleo. O default do TypeORM é uuid-ossp, que ele tenta `CREATE EXTENSION` a cada conexão — privilégio que o usuário da aplicação normalmente não tem em Postgres gerenciado.

**Busca full-text (FTS).** A tabela `posts` tem uma coluna gerada `search_vector tsvector` (`GENERATED ALWAYS AS ... STORED`) sobre título + descrição + código + tags, com índice **GIN**. As queries filtram com `search_vector @@ plainto_tsquery('portuguese', :termo)`. Como o TypeORM 1.x não conhece o tipo `tsvector`, a coluna e o índice são criados por SQL cru na migration e a coluna **não** é mapeada na entidade (as queries a referenciam por SQL). Detalhe importante: `array_to_string` é `STABLE`, não `IMMUTABLE`, então não pode entrar direto na expressão da coluna gerada — por isso as tags passam por uma função `posts_tags_to_text(text[])` declarada `IMMUTABLE` (determinística para um `text[]`), criada na mesma migration.

**Testes e o banco**: specs unitários mockam os `Repository<...>` e não precisam de banco. As **suítes e2e precisam do Postgres no ar com as migrations aplicadas**, e limpam as tabelas em `beforeAll` — como `posts` referencia `users` por FK, o `TRUNCATE` usa `CASCADE` (a `auth.e2e-spec` trunca `users` com CASCADE; a `posts.e2e-spec` trunca `users`/`posts`/`post_likes`/`comments`). Sem isso a suíte passaria uma vez e falharia depois por causa dos dados deixados pela execução anterior.

### Autenticação (apps/api)

- **Guard global, modelo opt-out.** O `AuthGuard` é registrado app-wide via `APP_GUARD`, então **toda rota exige JWT por padrão**; rotas públicas optam por sair com `@Public()`. Token JWT expira em 1h; o payload é `{ sub, email }` e é relido do banco quando a verdade atual importa (`GET /users/me`).
- **Auth opcional** (`src/common/guards/optional-auth.guard.ts`): para rotas que qualquer um vê mas que ficam mais ricas logado (o feed: público, com `likedByMe` quando há sessão). Ao contrário do guard global, ele **nunca lança** — anexa o usuário se houver Bearer token válido, senão segue anônimo. Uso: `@Public()` (para o guard global liberar) **+** `@UseGuards(OptionalAuthGuard)` na rota. O `@CurrentUser()` tolera `undefined` nessas rotas.

### Feed de posts (apps/api)

Módulo `src/posts` com as entidades e endpoints da feature:
- **Entidades**: `Post` (título, descrição, `content` de código, `thumbnailUrl` nullable, `tags` `text[]`, autor), `PostLike` (curtida, UNIQUE por usuário/post) e `Comment` (self-FK `parentId` para **um** nível de resposta — a regra de "não responder a uma resposta" é imposta no service; o schema permitiria mais).
- **Endpoints** (REST): `GET /posts` (feed público, com busca full-text e paginação), `GET /posts/:id` (detalhe público, com a árvore de comentários de 1 nível), `POST /posts` (protegido), `POST`/`DELETE /posts/:id/likes` (curtir idempotente / descurtir), `POST /posts/:id/comments` (comentar/responder). Contadores (`likesCount`, `commentsCount`) e `likedByMe` vêm de subqueries correlacionadas no QueryBuilder.
- **DTOs de resposta com `fromEntity`** (padrão do `UserResponseDto`): a entidade nunca é serializada direto.
- **Seed** (`pnpm api:seed`): recria as publicações a cada execução (`TRUNCATE ... CASCADE`) e faz upsert dos usuários por e-mail. Cria alguns posts **sem `thumbnailUrl`** de propósito (exercita o placeholder do frontend), com comentários/respostas/curtidas. Logins de teste: `julio@codeconnect.dev` (e marcia/gabriel/marcela `@codeconnect.dev`), senha `Senha@123`.

### Convenções de backend (apps/api)

Siga os princípios REST à risca em todos os endpoints:
- Modele URLs em torno de recursos/substantivos, não ações (`GET /users/:id`, não `/getUser`); use plural e aninhamento para relações (`/users/:id/orders`).
- Use os métodos HTTP conforme a semântica: `GET` (seguro, sem efeito colateral), `POST` (criar), `PUT`/`PATCH` (atualização total/parcial), `DELETE` (remover) — nunca um `GET` que muda estado.
- Retorne o status certo: `200`/`201`/`204` para sucesso (`201` na criação com corpo/`Location` do recurso criado, `204` para respostas sem conteúdo), `400`/`401`/`403`/`404`/`409` para erro do cliente, `500` só para falha inesperada do servidor.
- Mantenha stateless — sem estado de sessão no servidor entre requests; auth/contexto viajam no próprio request (headers/tokens).
- Valide e modele entrada/saída com DTOs (`class-validator`/`class-transformer` ou pipes do Nest) em vez de confiar no corpo cru.
- Versione a API ao introduzir mudança quebrando contrato (ex.: `/v1/...`) em vez de mutar contratos existentes.

**apps/web (Vite + React)**
- Entrada: `src/main.tsx` (monta `BrowserRouter` e `AuthProvider`) → `src/App.tsx` (declara as `Routes`). Roteamento é **react-router v8**; importe de `react-router`, não `react-router-dom`.
- **Rotas atuais**: `/` (feed, público), `/posts/:id` (detalhe, público) e `/posts/new` (criação, protegida) vivem sob o layout route `AppLayout` (menu lateral + `Outlet`); `/login` e `/register` usam o `AuthLayout`; `/dashboard` é protegida. Rotas protegidas passam pelo `ProtectedRoute` (`src/routes/`).
- **Camada de API e sessão**: `src/lib/http.ts` (instância axios, base `VITE_API_URL`, Bearer via interceptor), `src/lib/api-error.ts` (normaliza erros em `ApiError`), `src/lib/token-storage.ts` (token no localStorage). A sessão vive num contexto (`src/context/`, `AuthProvider` + hook `useAuth`). Serviços em `src/services/` (`auth.ts`, `posts.ts`) — como a API roda com `forbidNonWhitelisted`, monte os payloads campo a campo.
- Alias `@/` → `src/`, declarado em **ambos** `vite.config.ts` (bundler e Vitest) e `tsconfig.app.json` (type-checker). Adicionar um alias significa atualizar os dois.
- O TypeScript usa project references (`tsconfig.json` → `tsconfig.app.json` para o src, `tsconfig.node.json` para a config do Vite); `web:build` roda `tsc -b` antes do `vite build`, então erro de tipo trava o build.
- Lint é oxlint (não ESLint) — config em `.oxlintrc.json`. Regras type-aware ainda não estão ligadas (exigiriam `oxlint-tsgolint`).
- Testes são **Vitest + React Testing Library** em ambiente `jsdom`, configurados no bloco `test` do `vite.config.ts` com `globals: true` (não precisa importar `describe`/`it`/`expect`). `src/test/setup.ts` registra os matchers do `@testing-library/jest-dom` e o matcher de acessibilidade de `src/test/a11y.ts`.
- Helpers de teste em `src/test/`: `utils.tsx` exporta `renderWithRouter()` (para qualquer coisa que renderize um `Link` ou leia estado de rota) e `renderWithProviders()` (idem + `AuthProvider`, para componentes que chamam `useAuth()`); `post-fixtures.ts` tem fixtures de post.

### Convenções de frontend (apps/web)

- **Atomic design**: organize componentes sob `src/components/` por tier — `atoms/` (botões, inputs, labels — sem lógica de negócio), `molecules/` (combinações pequenas de átomos, ex.: um input rotulado), `organisms/` (seções autocontidas compostas de moléculas/átomos), `templates`/`pages` para layout e composição de rota. Não coloque em `atoms` um componente que compõe outros — suba de tier.
- **Tailwind CSS** é a abordagem de estilo — Tailwind v4 via `@tailwindcss/vite`, com design tokens declarados num bloco `@theme` em `src/index.css`. Prefira classes utilitárias a novos arquivos `.css` para componentes novos.
- **Ícones em SVG inline** (`src/components/atoms/icons.tsx`), com `currentColor` — não trazemos a fonte Material Icons do Figma (dependência externa + ponto de falha de rede). Ícone decorativo fica `aria-hidden`; ícone com significado precisa de nome acessível.
- **Imagens com fallback**: o átomo `Thumbnail` gera um placeholder determinístico (só com tokens de marca) quando `thumbnailUrl` é `null` ou a imagem falha ao carregar (`onError`) — não há imagem servida pelo backend.
- **Todo componente precisa de teste** cobrindo o uso essencial (renderiza, interação/prop principal) — nenhum componente entra sem um. Coloque como `Component.test.tsx` ao lado de `Component.tsx`, e inclua o componente na suíte central de a11y (`src/test/a11y.test.tsx`).

### Cores (apps/web)

Estilize sempre a partir dos tokens semânticos de `src/index.css` (`bg-surface-card`, `text-content-muted`, …). Nunca chumbe um hex nem use cor stock do Tailwind (`text-gray-400`, `bg-slate-800`) — isso fura a paleta e o orçamento de contraste abaixo.

O alvo é **WCAG 2.1 AA**: **4.5:1** para texto normal, **3:1** para texto grande (≥24px, ou ≥18.66px em negrito) e para UI não textual (bordas que sinalizam estado, anéis de foco, ícones que carregam significado — 1.4.11).

Razões medidas para os pares de tokens atuais:

| Frente | Fundo | Razão | Veredito |
| --- | --- | --- | --- |
| `content` | `surface-card` | 13.04:1 | ✅ |
| `content` | `surface-input` | 10.16:1 | ✅ |
| `content-muted` | `surface-page` | 5.67:1 | ✅ |
| `content-muted` | `surface-card` | 4.81:1 | ⚠️ passa, margem fina |
| `content-muted` | `surface-input` | 3.75:1 | ❌ falha em 4.5:1 |
| `brand-ink` | `brand-400` / `brand-500` | 11.20:1 / 9.02:1 | ✅ |
| `brand-500` / `brand-400` | `surface-card` | 10.76:1 / 13.37:1 | ✅ |
| `border-subtle` | `surface-card` | 1.50:1 | ❌ falha em 3:1 se for portante |
| `border-subtle` | `surface-input` | 1.17:1 | ❌ falha em 3:1 se for portante |
| anel de foco `brand-500` | `surface-card` | 10.76:1 | ✅ |

Regras que decorrem disso:
- **`content-muted` só é seguro sobre `surface-page` e `surface-card`** — nunca sobre `surface-input`. Essa combinação é usada em placeholders de input e falha.
- **`border-subtle` é decorativa.** Serve para um `Divider` ou o contorno em repouso de um input, mas não pode ser o *único* sinal de estado (erro, foco, selecionado) — isso exige 3:1, então combine com uma cor compliant, texto ou ícone.
- **Nunca codifique significado só na cor** (1.4.1). Um campo inválido precisa de `aria-invalid` mais texto visível, não só borda vermelha.
- **O foco tem de continuar visível** (2.4.7). Componentes usam `focus:outline-none` com um `focus-visible:ring-*` no lugar — se tirar o outline, tem de repor o ring.
- Recalcule a razão sempre que adicionar ou mudar um token; um "cinza levemente mais suave" é como o AA quebra.

### Tamanhos (apps/web)

- **Use a escala em rem do Tailwind** (`text-sm`, `p-4`, `gap-6`) e nunca `px` fixo de fonte ou altura de container — o texto tem de sobreviver a zoom de 200% (1.4.4) e a overrides de espaçamento do usuário (1.4.12). Não limite a altura de um container de texto; deixe crescer.
- **`text-xs` (12px) é o piso**, e só para rótulos genuinamente secundários. Corpo de texto é `text-sm`/`text-base`.
- **O layout tem de refluir a 320px de largura sem scroll horizontal** (1.4.10) — construa mobile-first, deixe painéis lado a lado empilharem (como o `AuthCard` faz com `hidden md:block`).
- **Alvos interativos: mire ≥24×24px, prefira 44×44px.** Isto *não* é exigência do 2.1 AA — 2.5.5 (44px) é AAA, e 2.5.8 (24px) é WCAG 2.2. É regra da casa, não portão de conformidade. Onde o controle visual é menor, a área de clique tem de ser maior: o `Checkbox` desenha uma caixa de 16px mas a envolve num `<label>`, então o texto do rótulo faz parte do alvo. Mantenha esse padrão.
- Controles só-ícone precisam de nome acessível (`aria-label`) — tamanho não substitui rótulo.

### Testes de acessibilidade (apps/web)

`pnpm web:test:a11y` roda o axe-core sobre cada tier de componente e sobre o `index.html`, restrito às tags WCAG 2.1 A/AA (helper: `src/test/a11y.ts`, matcher `toHaveNoA11yViolations`).

**Dois achados conhecidos ficam registrados em `a11y-document.test.tsx` como backlog**, não como quebra:
- o `index.html` declara `lang="en"` enquanto a UI toda está em português (WCAG 3.1.1). O axe *não* pega isso — `html-has-lang` só checa que o atributo existe e é bem formado, não que casa com o conteúdo — daí a asserção explícita.
- `<title>web</title>` é o default do scaffold do Vite, não um título descritivo de página (WCAG 2.4.2).

Não "conserte" esses afrouxando as asserções. Qualquer *outra* falha é regressão de verdade.

**Esta suíte não checa cor.** O jsdom não tem layout nem canvas, então a regra `color-contrast` do axe sai sempre como *incomplete* — as razões acima foram calculadas à mão e não são impostas por nenhum teste. Contraste, visibilidade de foco, reflow e ordem de tab precisam de navegador real (`@axe-core/playwright`) ou revisão manual. Trate um a11y verde como necessário, não suficiente.

## Convenções do workspace

- O gerenciador de pacotes é **pnpm** (veja `pnpm-workspace.yaml` na raiz: `packages: apps/*`). Não use npm/yarn.
- Cada app tem seu próprio lockfile/referência de `pnpm-workspace.yaml` além do da raiz — instale e rode scripts pelos filtros do pnpm (`pnpm --filter api ...` / `pnpm --filter web ...`) em vez de `cd` manual sempre que der.
- **Conventional Commits** são obrigatórios em todo commit do repo: `<tipo>(<escopo>): <descrição>`, ex.: `feat(web): add Button atom`, `fix(api): correct order status codes`. Tipos comuns: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Use o nome do app (`api`/`web`) como escopo quando o commit for específico de um.
