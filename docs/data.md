# Akiさんの仕事一元管理アプリ — 設計セッションまとめ

作成日：2026-04-14

---

## 1. 業務の全体像（親和図）

### 📋 プロジェクト計画・立ち上げ
- プロジェクト立ち上げ
- WBS作成 / ガントチャート作成
- 見積もり実施
- 方法論の選択（ウォーターフォール / アジャイル / ハイブリッド）

### 📊 プロジェクト実行・監視
- 工数の予実監視
- テストケース作成 / テスト結果管理
- バグ監視 / 死活監視
- 運用保守
- 反省会 / 反省事項の管理

### 👥 チームマネジメント
- 朝会
- 議事録 → 決定事項の整理 → 共有 → タスク化
- メンバーの今日やること一覧
- メンバーの統合プロファイル
- 新入社員立ち上げサポート

### 📚 ナレッジ・ドキュメント管理
- 各種マニュアル管理
- 飲み会幹事マニュアル
- 店の場所と独自口コミ

### 🎓 学習・情報収集
- Salesforceに関する勉強
- PMとしての勉強（PMBOK等）
- 最新情報収集
- 勉強会

### 💻 技術・開発
- Salesforceの導入支援
- AIによる開発・開発基盤構築
- 新規アプリの開発

### 🏠 番外編（でも大事）
- 妻のストレス監視

---

## 2. システム基本方針

| レイヤー | 技術選定 |
|---|---|
| UI層 | React + Vite（localhost）|
| データ層 | GitHub Issues / Projects v2 / Markdownファイル |
| 自動化・連携 | CLIツール（Node.js）+ MCP Server |
| AI連携 | Claude Code / claude.ai（MCP経由）|
| 管理 | GitHub Private Organization |

**サーバーレス前提：** 外部サーバーを立てない。データはGitHubに集約。

---

## 3. GitHubリポジトリ構成

### Organization構成（推奨）

```
[Your Org]
│
├── 📦 mgmt-hub              ← ★中枢。全体の起点
│   ├── /app                 (ローカルUI React+Vite)
│   ├── /cli                 (CLIツール群)
│   ├── /mcp                 (MCP Server)
│   ├── /members             (メンバープロファイル .md)
│   ├── /manuals             (各種マニュアル .md)
│   └── /knowledge           (口コミ・ナレッジ)
│
├── 📦 project-sf-a          ← Salesforce導入支援 A社
├── 📦 project-sf-b          ← Salesforce導入支援 B社
├── 📦 project-newapp        ← 新規アプリ開発
└── 📦 project-internal      ← 社内基盤・AI開発
```

> **ポイント：** project-* リポジトリはSFDXソース等の実際の開発リポジトリと兼用可能。コードとタスクを同一リポジトリで管理できる。

---

## 4. GitHub Projects v2 構成

```
[Org Level Projects]
│
├── 🗂️ Master Dashboard       ← 全プロジェクト横断（Akiの今日のタスク）
│
├── 🗂️ Project-SF-A Board     ← Aプロジェクト専用
│   └── タイムラインビュー → ガントチャート代わり
│
├── 🗂️ Project-SF-B Board
└── 🗂️ Project-NewApp Board
```

---

## 5. Issueラベル設計（全リポジトリ統一）

| 種別ラベル | ステータスラベル | 優先度ラベル |
|---|---|---|
| type:task | status:todo | p:high |
| type:bug | status:in-progress | p:medium |
| type:decision | status:blocked | p:low |
| type:retrospective | status:done | |
| type:meeting-note | | |
| type:risk | | |

> **注意：** ラベルはCLIで一括作成スクリプトを最初に作ること。手動設定は後でカオスになる。

---

## 6. データの所在マップ

| 情報 | 場所 | 理由 |
|---|---|---|
| タスク / バグ | 各 project-* repo の Issue | プロジェクト文脈と一緒に管理 |
| 決定事項 | 各 project-* repo の Issue（type:decision） | 経緯をコメントで追える |
| 工数予実 | Issue カスタムフィールド + JSON集計 | Projects v2のNumber fieldを使う |
| 朝会メモ / 議事録 | mgmt-hub `/meeting-notes/YYYY-MM-DD.md` | gitで差分管理 |
| 反省事項 | 各 project-* repo の Issue（type:retrospective）| プロジェクトに紐づける |
| マニュアル | mgmt-hub `/manuals/` | 横断共有 |
| メンバープロファイル | mgmt-hub `/members/` | 横断共有 |
| テストケース / 結果 | 各 project-* repo `/tests/` | コードと同居 |

---

## 7. 全体アーキテクチャ図

```
┌─────────────────────────────┐
│   Local UI (React + Vite)   │
│      localhost:3000         │
└────────────┬────────────────┘
             │ GitHub REST API / GraphQL
┌────────────▼────────────────┐
│   GitHub Private Org        │
│  ├── Issues & Projects v2   │
│  ├── Markdown（マニュアル等）│
│  └── JSON（マスターデータ）  │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   CLI Tools（Node.js）      │
│  ├── 朝会サポート            │
│  ├── 議事録 → Issue 自動生成 │
│  ├── 工数入力               │
│  └── MCP Server             │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   Claude（MCP経由）          │
│   Claude Code / claude.ai   │
└─────────────────────────────┘
```

---

## 8. 主要な情報フロー

```
朝会
 └─ CLI起動
     ├─ GitHub Projectsから今日のタスク取得
     ├─ AI要約（MCP経由）
     └─ meeting-notes/今日.md 生成

議事録
 └─ CLI or MCPで
     ├─ 決定事項 → Issue自動生成（type:decision）
     └─ タスク   → Issue自動生成（type:task）+ Project紐付け

反省会
 └─ retrospective Issueをまとめてlist → AI要約 → 次プロジェクトへ反映
```

---

## 9. ローカルUI 画面構成（案）

| 画面 | 内容 |
|---|---|
| ダッシュボード | 今日のタスク / 朝会サマリー / 監視ステータス |
| プロジェクト管理 | WBS / ガントチャート / 工数予実 |
| チーム | メンバープロファイル / 今日やること一覧 |
| ナレッジ | マニュアル一覧 / 口コミDB |
| ログ | 決定事項 / 反省事項 / 議事録アーカイブ |

> **大胆提案：** GitHub Projectsのタイムラインビューはガントチャートとしてほぼ使えるため、**ガントチャートUIは自作不要かも**。その分のリソースをCLI・MCP側に全振りした方がコスパ良い。

---

## 10. 実装フェーズ計画

```
Phase 1: 基盤
  1. GitHub Org作成
  2. リポジトリ作成（mgmt-hub + project-*）
  3. ラベル一括作成CLI

Phase 2: コアCLI
  4. Issue CRUD CLI
  5. 朝会サポートCLI（今日のタスク取得 + AI要約）
  6. 議事録 → Issue変換CLI

Phase 3: ローカルUI
  7. ダッシュボード（Org横断タスク一覧）
  8. プロジェクト別ビュー

Phase 4: MCP化
  9. MCP Server実装
  10. Claude Code / claude.aiから自然言語で操作可能に
```

---

## 11. 注意点・リスク

- **GitHub API Rate Limit：** 認証済みで5,000 req/時。UIでのポーリング設計に注意。ローカルキャッシュ戦略を検討。
- **ラベル設計は最初が肝心：** 後から変えるとIssueが大量に壊れる。
- **Milestoneの活用：** スプリントやフェーズの代わりに使うと工数管理しやすい。
- **GitHub Org無料プラン：** Private repoは無制限。GitHub Actions月2000分制限あり（今回はActions不使用なので問題なし）。
- **妻のストレス監視：** GitHub Issueには入れないこと。通知メールのタイトルが見えると大惨事。ローカルJSONでの管理を推奨。

