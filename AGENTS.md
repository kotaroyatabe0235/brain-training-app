# AGENTS.md

## Structure

Monorepo with npm workspaces:
- Root `package.json` manages workspaces and git hooks (Husky)
- `client/` — React 19 + Vite + Tailwind CSS v4 + Zustand
- `server/` — Express + Prisma + PostgreSQL

## Commands

### Client (`client/`)
```bash
npm run dev            # Vite dev server (port 5173)
npm run build          # tsc -b && vite build
npm run lint           # ESLint
npm run lint:fix       # ESLint --fix
npm run format         # Prettier on src/**/*.{ts,tsx,css}
npm run test           # vitest run
npm run test:watch     # vitest (watch mode)
npm run test:coverage  # vitest run --coverage
npm run test:mutation  # stryker run
npm run test:e2e       # playwright test
npm run test:e2e:ui    # playwright test --ui
```

### Server (`server/`)
```bash
npm run dev            # tsx watch src/index.ts (port 3001)
npm run build          # tsc
npm run lint           # ESLint
npm run test           # vitest run
npm run test:watch     # vitest (watch mode)
npm run test:coverage  # vitest run --coverage
npm run test:mutation  # stryker run
npm run test:integration  # vitest run --config vitest.integration.config.ts
npm run db:generate    # prisma generate
npm run db:push        # prisma db push (no migration file)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # tsx prisma/seed.ts
```

**Prerequisites:** PostgreSQL must be running locally. Server reads `server/.env` (DATABASE_URL, JWT_SECRET, PORT). Run `db:generate` after any schema change.

## Key conventions

- **Server imports use `.js` extensions** — required by NodeNext module resolution (`import from './foo.js'`).
- **Client uses Tailwind CSS v4** via `@tailwindcss/vite` plugin, not the v3 PostCSS approach. No `tailwind.config.js` exists.
- **Zod** for request validation on the server (`server/src/types/`).
- **Prisma schema** uses `@@map` to snake_case table/column names; Prisma client fields are camelCase.
- **Auth flow:** JWT stored in `localStorage`, sent via `Authorization: Bearer` header. 401 responses auto-clear token and redirect to `/login`.
- **Server error responses** use Japanese messages (e.g. `サーバーエラーが発生しました`).

## Testing

- **Framework:** Vitest（ユニットテスト）+ Stryker（ミューテーションテスト）
- **Thresholds:** カバレッジ80%以上、ミューテーションスコア80%以上が必須。閾値未達は自動でテスト失敗する。
- **Test file convention:** テストファイルは被テストファイルと同じディレクトリに配置。命名は `*.test.ts`（server）または `*.test.{ts,tsx}`（client）。
- **Server tests:** `server/src/__tests__/` 配下に配置。Prismaは `vi.mock()` でモックする。环境は `node`。
- **Client tests:** `client/src/` 内に被テストファイルと同じディレクトリに配置。React Testing Library を使用。環境は `jsdom`。
- **Coverage config:** `vitest.config.ts` 内の `coverage.thresholds` で80%閾値を設定。`test:coverage` スクリプトで確認。
- **Mutation config:** `stryker.conf.ts` で `thresholds.break: 80` を設定。`test:mutation` スクリプトで確認。
- **Server integration tests:** `server/src/__tests__/*.integration.test.ts`。Supertest で HTTP リクエストを検証。Prisma・env を `vi.mock()` でモック。
- **E2E tests:** `client/e2e/tests/*.spec.ts`。Playwright でブラウザ上にフルテスト。`webServer` で server/client を自動起動。
- **Testing strategy:** 3層構造（単体→統合→E2E）。単体テストは速く多数作成、統合テストはAPI境界を検証、E2Eは実際のブラウザでユーザーフローを検証。
- **Pre-push hook:** `git push` 時に自動で全テスト（ユニット・カバレッジ・ミューテーション）を実行。失敗でpushをブロック。設定は `.husky/pre-push`。

## No CI

No GitHub Actions or CI config exists.
