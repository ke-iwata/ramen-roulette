# 🍜 ラーメンルーレット

江戸川区近辺(新小岩・小岩・本八幡・錦糸町・亀戸・平井・葛西・西葛西・都営新宿線沿線)のラーメン屋をルーレットで決める Web アプリ。

- 駅ごとにグルーピングされた店舗一覧からカードで候補を選択・確定
- 3Dカルーセルのルーレットを回すとアニメーション付きで 1 件が決定
- 当選店の食べログ/公式サイト・Googleマップ(営業時間/混雑の確認)へのリンクを表示
- 店の自由追加が可能(追加店・選択状態は localStorage に保存)
- クライアントのみで完結(サーバー不要)

## 店舗データについて

[src/data/gyms.ts](src/data/gyms.ts) に静的に保持しています。2026年7月時点で「ラーメン + 各駅」のGoogleマップ検索結果から取得した287店で、閉業表示の店舗は除外済みです。評価・写真・地図リンクもGoogleマップのものです。

## ローカルでの動作確認

```bash
npm install
npm run dev
```

http://localhost:5173 で確認できます。

本番ビルドの確認:

```bash
npm run build
npm run preview
```

## GitHub Pages へのデプロイ

`main` ブランチへ push すると GitHub Actions([.github/workflows/deploy.yml](.github/workflows/deploy.yml))が自動でビルドして GitHub Pages に公開します。

初回のみリポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に変更してください。

`vite.config.ts` で `base: './'` を指定しているため、リポジトリ名に関係なくそのまま動作します。
