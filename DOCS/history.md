# プロジェクト履歴

## 概要
脳トレWebアプリケーションの開発プロジェクト。

---

## 開発ログ

### 2025-07-10: 要件定義
- `DOCS/spec.md` 作成
- プラットフォーム: Webアプリ（レスポンシブ対応）
- ゲーム種類: 計算力、記憶力、語彙力、論理思考、反応速度（全5カテゴリ15ゲーム）
- 技術スタック: React + TypeScript / Vite / Tailwind CSS / Node.js + Express / PostgreSQL
- 開発期間: 約9週間（5フェーズ）

### 2025-07-10: Phase1 プロジェクトセットアップ
- Vite + React + TypeScriptプロジェクト作成
- Tailwind CSS v4設定
- ESLint + Prettier設定
- ディレクトリ構成作成

### 2026-07-11: Phase1 バックエンド + 認証機能
- バックエンドプロジェクト作成（server/）
  - Node.js + Express + TypeScript
  - Prisma ORM（PostgreSQL）
  - JWT認証
- データベース設計
  - users, games, scores, badges, user_badgesテーブル
  - GameCategory, Difficulty enum
- 認証API実装
  - POST /api/auth/register（新規登録）
  - POST /api/auth/login（ログイン）
  - GET /api/auth/me（プロフィール取得）
- フロントエンド認証UI
  - ログインページ（/login）
  - 登録ページ（/register）
  - ホームページ（/）
  - 認証ガード（ProtectedRoute）
  - Zustand認証ストア
  - APIクライアント（axios）

---

## ディレクトリ構成

```
brain-training-app/
├── DOCS/
│   ├── spec.md          # 要件定義書
│   └── history.md       # このファイル
├── server/              # バックエンド
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/      # 環境変数、Prisma設定
│   │   ├── controllers/ # リクエストハンドラ
│   │   ├── middleware/   # 認証ミドルウェア
│   │   ├── routes/      # APIルート
│   │   ├── services/    # ビジネスロジック
│   │   ├── types/       # 型定義
│   │   └── index.ts     # エントリーポイント
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
└── client/              # フロントエンド
    ├── src/
    │   ├── components/  # 共通UIコンポーネント
    │   │   └── ProtectedRoute.tsx
    │   ├── games/       # ゲームモジュール
    │   ├── hooks/       # カスタムフック
    │   ├── pages/       # ページコンポーネント
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── services/    # API通信
    │   │   └── api.ts
    │   ├── stores/      # 状態管理
    │   │   └── authStore.ts
    │   ├── types/       # 型定義
    │   │   ├── auth.ts
    │   │   └── index.ts
    │   └── utils/       # ユーティリティ
    ├── eslint.config.js
    ├── .prettierrc
    ├── package.json
    └── vite.config.ts
```

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | React + TypeScript | 19.x / 6.x |
| ビルドツール | Vite | 8.x |
| CSS | Tailwind CSS | 4.x |
| Linting | ESLint + Oxlint | 10.x / 1.x |
| Formatting | Prettier | 3.x |
| バックエンド | Node.js + Express | 4.x |
| ORM | Prisma | 6.x |
| 認証 | JWT + bcryptjs | 9.x / 2.x |

---

## 次のタスク
- [x] Phase1: 認証機能実装（登録/ログイン）
- [x] Phase1: データベース設計・セットアップ
- [ ] Phase2: コアゲーム実装
