# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is a pnpm workspace monorepo with two independent apps:

- `apps/api` — NestJS backend (Express platform), TypeScript, Jest for tests.
- `apps/web` — React 19 + Vite frontend, TypeScript, oxlint for linting.

There is no shared package between them yet, and no code linking the two apps together (no proxy/API client wiring in `apps/web` pointing at `apps/api`). Both are currently near-default framework scaffolds (NestJS starter, Vite React starter) with minimal custom code — expect to be building out real structure rather than following deep existing patterns.

## Commands

All commands can be run from the repo root via root `package.json` scripts, or with `pnpm --filter <api|web> <script>` / `cd` into the app directory.

Root shortcuts:
```
pnpm dev              # run both api and web dev servers in parallel
pnpm api:dev          # nest start --watch (apps/api)
pnpm web:dev          # vite dev server (apps/web)
pnpm api:build        # nest build
pnpm web:build        # tsc -b && vite build
pnpm api:lint         # eslint --fix over apps/api
pnpm web:lint         # oxlint over apps/web
pnpm api:test         # jest unit tests for apps/api
```

Inside `apps/api`:
```
pnpm test                  # unit tests (jest, *.spec.ts, rootDir: src)
pnpm test:watch
pnpm test:cov
pnpm test:e2e               # jest --config ./test/jest-e2e.json
pnpm test -- app.controller # run a single test file/pattern (jest arg passthrough)
pnpm start:debug             # nest start --debug --watch
```

Inside `apps/web`:
```
pnpm dev       # vite
pnpm build     # tsc -b && vite build (type-checks via project references, then bundles)
pnpm lint      # oxlint
pnpm preview   # preview production build
```

## Architecture notes

**apps/api (NestJS)**
- Standard Nest module/controller/service structure rooted at `apps/api/src`, bootstrapped in `main.ts` via `NestFactory.create(AppModule)`, listening on `process.env.PORT ?? 3000`.
- `nest-cli.json` sets `sourceRoot: src`; build output goes to `dist`.
- Jest config lives inline in `apps/api/package.json` (not a separate jest.config file): `rootDir` is `src`, test files matched by `*.spec.ts`, e2e tests live under `apps/api/test` with their own `jest-e2e.json` config.
- ESLint (`apps/api/eslint.config.mjs`) uses flat config with `typescript-eslint` recommendedTypeChecked + prettier integration. Notable relaxed rules: `no-explicit-any` off, `no-floating-promises` and `no-unsafe-argument` are warnings, not errors.
- tsconfig targets ES2023, uses decorators/metadata (required for Nest DI), `noImplicitAny: false`.

### Backend conventions (apps/api)

Follow REST principles strictly for all endpoints:
- Model URLs around resources/nouns, not actions (`GET /users/:id`, not `/getUser`); use plural resource names and nesting for relationships (`/users/:id/orders`).
- Use HTTP methods per their semantics: `GET` (safe, no side effects), `POST` (create), `PUT`/`PATCH` (full/partial update), `DELETE` (remove) — never a `GET` that mutates state.
- Return correct status codes: `200`/`201`/`204` for success (`201` for creation with a `Location`/created resource body, `204` for no-content responses), `400`/`401`/`403`/`404`/`409` for client errors, `500` only for unexpected server faults.
- Keep it stateless — no server-side session state between requests; auth/context travels in the request itself (headers/tokens).
- Validate and shape input/output with DTOs (`class-validator`/`class-transformer` or Nest pipes) rather than trusting raw request bodies.
- Version the API when introducing breaking changes (e.g. `/v1/...`) instead of mutating existing contracts.

**apps/web (Vite + React)**
- Entry: `src/main.tsx` → `src/App.tsx`. Plain Vite React template with no router or state library installed yet.
- TypeScript uses project references (`tsconfig.json` → `tsconfig.app.json` for src, `tsconfig.node.json` for Vite config); `web:build` runs `tsc -b` before `vite build`, so type errors block the build.
- Linting is oxlint (not ESLint) — config in `.oxlintrc.json`, currently just `react` + `typescript` + `oxc` plugins with two rules enabled. Type-aware lint rules are not yet enabled (would require `oxlint-tsgolint`).
- No test runner is configured for `apps/web` yet — Vitest + React Testing Library is the natural fit for a Vite project and should be set up before/alongside the first component test.

### Frontend conventions (apps/web)

- **Atomic design**: organize components under `src/components/` by tier — `atoms/` (buttons, inputs, labels — no business logic), `molecules/` (small combinations of atoms, e.g. a labeled input), `organisms/` (self-contained sections composed of molecules/atoms), `templates`/`pages` for layout and route-level composition. Don't put a component in `atoms` if it composes other components — bump it up a tier.
- **Tailwind CSS** is the styling approach going forward — not yet installed in `apps/web`; add it (`tailwindcss` + Vite plugin) before writing Tailwind classes rather than mixing with the current plain CSS files. Prefer utility classes over new `.css` files for new components.
- **Every component needs a test** covering its essential usage (renders, primary interaction/prop behavior) — no component should be merged without one. Co-locate as `Component.test.tsx` next to `Component.tsx`.

## Workspace conventions

- Package manager is **pnpm** (see `pnpm-workspace.yaml` at root: `packages: apps/*`). Don't use npm/yarn.
- Each app has its own lockfile/`pnpm-workspace.yaml` reference in addition to the root — install and run scripts through pnpm filters (`pnpm --filter api ...` / `pnpm --filter web ...`) rather than `cd`-ing manually where possible.
- **Conventional Commits** are required for every commit across the whole repo: `<type>(<scope>): <description>`, e.g. `feat(web): add Button atom`, `fix(api): correct order status codes`. Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Use the app name (`api`/`web`) as scope when a commit is app-specific.
