# JS → TypeScript リファクタリング実践プロジェクト
URL: https://dofin-p.github.io/TypeScript-ver-JS-/

[元のJavaScriptリポジトリ](https://github.com/Dofin-p/Javascript-)のコードをTypeScriptへ完全移行したリファクタリングプロジェクトです。
単純な型付けにとどまらず、**アーキテクチャの再設計**を伴う移行を実施しました。

## 使用技術

- TypeScript（strict モード有効）
- Vite
- HTML / CSS

## セットアップ

```bash
npm install
npm run dev
```

## 移行の進め方

### STEP 1 : ロジックの抽出と分離

既存の `index.js` を、以下の3つの観点で分析してから着手しました。

- **状態（State）** : どの変数が変化しているか
- **副作用（Side Effects）** : DOM操作・イベントリスナーの登録
- **純粋関数** : DOMに依存しない計算・文字列処理

密結合なコードをそのまま移植せず、責務ごとに分離した設計に再構成しています。

### STEP 2 : 静的リソースの配置

Viteのプロジェクト構造に合わせてHTMLとCSSを移植し、`style.css` を `src/` 配下に配置して `main.ts` からインポートする形に整理しました。

### STEP 3 : DOM要素の型定義と取得

`document.querySelector` で取得した要素に対して `HTMLButtonElement` や `HTMLUListElement` などの適切な型を付与しました。
`as`（型アサーション）による強制を避け、`instanceof` を用いた実行時の型絞り込みを採用しています。

### STEP 4 : ロジックの再実装と型付け

関数の引数・戻り値・イベントオブジェクト（`MouseEvent` 等）に型を明示しました。
外部APIから取得するデータには詳細な `interface` を定義し、戻り値の型も明示しています。

### STEP 5 : リファクタリングと品質向上

- `tsconfig.json` の `strict: true` 有効化
- 命令的な `for` ループから宣言的な `forEach` への書き換え
- アプリ起動処理を `init` 関数へ集約し、保守性を向上

---

## 苦戦した点

- Vite環境におけるエントリーポイントのパス指定と404エラーの解消
- HTMLタグと TypeScript の型（`HTMLUListElement` 等）の正確な対応付け

## 工夫した点

- API通信中のボタン非活性化（二重リクエスト防止）を実装し、UXに配慮
- 命令的な `for` ループから宣言的な `forEach` への書き換えによるコードの簡潔化


---

## デプロイ環境構築（GitHub Pages）

公開URL: https://dofin-p.github.io/TypeScript-ver-JS-/

### 構成

- **ビルドツール**: Vite
- **デプロイ先**: GitHub Pages（GitHub Actions 経由で自動デプロイ）

### 工夫・苦戦した点

#### `base` パスの設定

GitHub Pages はサブディレクトリ（`/TypeScript-ver-JS-/`）配信になるため、`vite.config.ts` に `base` オプションを明示的に設定する必要があった。

```ts
// vite.config.ts
export default defineConfig({
  base: "/TypeScript-ver-JS-/",
});
```

設定しないと、ビルド後の `dist/index.html` が `/assets/...` という絶対パスでアセットを参照してしまい、GitHub Pages 上で JS・CSS が 404 になる。

#### `index.html` の相対パス指定

`<script src="/src/main.ts">` のような **ルート絶対パス** は GitHub Pages のサブディレクトリ配信で壊れる。
開発時は `./src/main.ts` に統一し、Vite がビルド時に自動で `base` を付与する流れにした。

#### GitHub Actions による自動デプロイ

`.github/workflows/deploy.yml` を作成し、`main` ブランチへの push をトリガーに以下の流れで自動公開。

```
push to main
  → npm ci
  → npm run build（tsc + vite build）
  → actions/upload-pages-artifact（dist/を転送）
  → actions/deploy-pages（GitHub Pages へ公開）
```

GitHub リポジトリの `Settings > Pages > Source` で **GitHub Actions** を選択しておく必要がある。

#### ローカルでの本番確認方法

```bash
npm run build    # dist/ を生成
npm run preview  # http://localhost:4173/TypeScript-ver-JS-/ で確認
```

