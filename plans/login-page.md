# Plano: Página de Login (code-connect)

## Context

O app `apps/web` é hoje um boilerplate Vite + React 19 + TS 6 quase intocado (só `App.tsx`/`main.tsx` de demo, CSS roxo, `#root` fixo em 1126px). Precisamos construir a **página de Login** da marca "code connect" a partir do mockup fornecido, seguindo as convenções do `CLAUDE.md` (atomic design, Tailwind, um teste por componente).

O mockup mostra: fundo escuro com marcas d'água do logo em elo/corrente → **card central arredondado** com duas colunas → **esquerda** o banner (`banner_login.jpg`), **direita** o formulário (título "Login", subtítulo, campo "Email ou usuário", campo "Senha", linha "Lembrar-me" + "Esqueci a senha", botão verde "Login →", divisor "ou entre com outras contas", ícones Github/Gmail, rodapé "Ainda não tem conta? Crie seu cadastro!"). Accent = **verde da marca**.

Objetivo extra: o **layout base deve ser reutilizável** pela futura página de Cadastro (mesmo layout, banner e campos diferentes) — sem implementar o cadastro agora, mas deixando os pontos de reuso prontos.

Decisões confirmadas com o usuário: **instalar react-router** (rotas `/login` e `/register` placeholder) e **configurar testes agora** (Vitest + RTL).

## Setup de tooling (base)

1. **Tailwind CSS v4** (abordagem Vite nativa, mais limpa que v3+postcss):
   - `pnpm --filter web add -D tailwindcss @tailwindcss/vite`
   - Em `apps/web/vite.config.ts`: adicionar o plugin `@tailwindcss/vite`.
   - Em `apps/web/src/index.css`: substituir o conteúdo de demo por `@import "tailwindcss";` + um bloco `@theme` com os tokens da marca. **Remover** as regras de demo (`#root { width:1126px; text-align:center; border-inline }`, etc.) que quebram uma tela full-viewport. Manter só reset mínimo (`body { margin:0 }`, `#root { min-height:100dvh }`).
   - Tokens `@theme` (derivados do mockup):
     - `--color-brand-400: #5ef08a` (botão), `--color-brand-500: #3ecf6a` (links, checkbox, foco)
     - `--color-surface-page: #0a0d0f`, `--color-surface-card: #1b1f24`, `--color-surface-input: #2b3037`
     - `--color-border-subtle: #343b43`, texto `#e6e8ea` / muted `#9aa0a6`
   - `App.css` deixa de ser importado (a demo sai); pode ser removido.

2. **react-router** (v7):
   - `pnpm --filter web add react-router`
   - `main.tsx`: envolver `<App/>` em `<BrowserRouter>`.
   - `App.tsx`: `<Routes>` com `/login` → `LoginPage`, `/register` → `RegisterPage` (placeholder), `/` → redirect para `/login`.

3. **Vitest + RTL + jsdom**:
   - `pnpm --filter web add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`
   - `vite.config.ts`: bloco `test` (`environment: 'jsdom'`, `globals: true`, `setupFiles`).
   - `src/test/setup.ts`: `import '@testing-library/jest-dom'`.
   - `package.json` (web): script `"test": "vitest"` (+ `"test:run": "vitest run"`).
   - `tsconfig.app.json`: incluir `vitest/globals` e `@testing-library/jest-dom` nos types se necessário.

4. (Opcional, recomendado) alias `@/` → `src/` em `vite.config.ts` + `tsconfig.app.json` para imports limpos.

## Atomic design — componentes (`apps/web/src/components/`)

Cada componente ganha um `Component.test.tsx` co-localizado.

**atoms/**
- `Button` — variante primária verde full-width (`Login →`); props `type`, `variant`, `children`, `icon`.
- `Input` — input dark reutilizável (text/password) via props (`type`, `placeholder`, `value`, `onChange`, `id`).
- `Label` — label de campo.
- `Checkbox` — checkbox verde "Lembrar-me" (label + estado).
- `TextLink` — link verde estilizado (envolve `Link` do react-router ou `<a>`); usado em "Esqueci a senha" e "Crie seu cadastro!".
- `SocialButton` — botão com ícone (`Github.png`/`Google.png`) + label ("Github"/"Gmail").
- `Divider` — linha com texto central opcional ("ou entre com outras contas").
- `BrandMark` — SVG do elo/corrente em verde (reaproveita o traçado do `favicon.svg`, recolorido) para as marcas d'água do fundo.

**molecules/**
- `FormField` — `Label` + `Input` (+ slot de erro). Base de todo campo.
- `RememberForgot` — `Checkbox` "Lembrar-me" + `TextLink` "Esqueci a senha".
- `SocialLoginGroup` — `Divider` "ou entre com outras contas" + linha de `SocialButton` (Github, Gmail).
- `SignupPrompt` — texto + `TextLink` via props ("Ainda não tem conta? / Crie seu cadastro!") — genérico p/ reuso no login/cadastro.

**organisms/**
- `LoginForm` — form completo da coluna direita (título, subtítulo, 2 `FormField`, `RememberForgot`, `Button`, `SocialLoginGroup`, `SignupPrompt`). Controla estado local dos campos e `onSubmit` (stub — sem backend ainda).
- `AuthCard` — **card de duas colunas reutilizável**: coluna banner via props (`bannerSrc`, `bannerAlt`) + `children` (o form). É o principal ponto de reuso do cadastro.

**templates/**
- `AuthLayout` — full-viewport: fundo `surface-page` + marcas d'água (`BrandMark`) + centraliza os `children`. Reutilizável por qualquer tela de auth.

**pages/**
- `LoginPage` — `AuthLayout` › `AuthCard` (banner = `/banner_login.jpg`) › `LoginForm`.
- `RegisterPage` — **placeholder** por enquanto: `AuthLayout` › `AuthCard` (banner = a definir) › "Cadastro em breve". Só para a rota existir e provar o reuso do layout.

### História de reuso (cadastro futuro)
`AuthLayout` + `AuthCard` + `FormField`/`SocialLoginGroup`/`SignupPrompt`/`Button`/`Input` são agnósticos ao conteúdo. O cadastro só precisará de um `RegisterForm` novo (campos diferentes) e um banner diferente passado ao `AuthCard`.

## Arquivos a criar/modificar (principais)
- Modificar: `apps/web/vite.config.ts`, `apps/web/src/index.css`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/package.json`, `apps/web/tsconfig.app.json`.
- Remover: `apps/web/src/App.css` (demo).
- Criar: `apps/web/src/test/setup.ts`, e a árvore `src/components/{atoms,molecules,organisms,templates,pages}/…` com componentes + testes.
- Assets já presentes em `public/`: `banner_login.jpg`, `Github.png`, `Google.png`.

## Verificação (end-to-end)
1. `pnpm --filter web dev` → abrir `/login`: card centralizado no fundo escuro, banner à esquerda, form à direita, botão verde, ícones sociais, links funcionando; "Crie seu cadastro!" navega para `/register` (placeholder).
2. Responsivo: em largura pequena o banner recolhe/some e o form ocupa o card; sem scroll horizontal.
3. `pnpm --filter web test:run` → todos os testes de componente passam.
4. `pnpm --filter web build` → `tsc -b && vite build` sem erros de tipo.
5. `pnpm --filter web lint` → oxlint limpo.

## Commits (Conventional Commits, escopo `web`)
Ex.: `chore(web): setup tailwind, react-router e vitest`; `feat(web): add auth atoms and molecules`; `feat(web): add login page with reusable auth layout`.
