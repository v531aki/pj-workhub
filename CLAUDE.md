# pj-workhub 開発ガイド

## HTMLプレビュー

このプロジェクトは htmlpreview.github.io を使ってブラウザでプレビューできます。

### プレビューURL

```
https://htmlpreview.github.io/?https://github.com/v531aki/pj-workhub/blob/main/dist/index.html
```

### 開発後の手順

機能を追加・修正したら、必ず以下の手順でビルドしてコミットしてください。

```bash
# ビルド（dist/ を更新）
npm run build

# dist/ を含めてコミット
git add dist/
git commit -m "build: プレビュー更新"
git push
```

ビルド後、上記のプレビューURLを共有することで最新の画面を確認できます。

### 仕組み

- `vite.config.js` に `base: './'` を設定しているため、ビルド成果物が相対パスで動作します
- `dist/` はGitで管理しています（`.gitignore` から除外済み）
- htmlpreview.github.io は GitHub 上のHTMLファイルをそのままブラウザでレンダリングします
