# 浦川 仁成 記事図鑑

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/urakawa-jinsei/urakawa-jinsei.github.io)

Zennで公開している記事をカードコレクション風に紹介するGitHub Pagesサイトです。

## プロジェクト構成

```
.
├── index.html                # トップページ
├── assets
│   ├── css
│   │   └── styles.css        # レイアウトとテーマのスタイル
│   ├── data
│   │   └── zenn-feed.json    # GitHub Actionsで生成される記事データ
│   └── js
│       └── app.js            # フィルター・検索などのインタラクション
├── scripts
│   └── fetch_zenn_feed.py    # RSSをJSONに変換するスクリプト
└── .github
    └── workflows
        └── update-zenn-feed.yml  # 記事データを更新するGitHub Actions
```

## 記事データの取得方法

GitHub Actionsで1時間ごとにZennのRSSフィード（`https://zenn.dev/urakawa_jinsei/feed?all=1`）を取得し、変換したJSON（`assets/data/zenn-feed.json`）をコミットしています。フロントエンドはこのJSONファイルを読み込み、記事一覧を表示します。

- ワークフローは `.github/workflows/update-zenn-feed.yml` に定義されており、必要に応じて手動実行（workflow_dispatch）も可能です。
- 取得したJSONには最新記事と最終更新日時が含まれます。取得に失敗した場合はGitHub Actionsがエラーとなり、サイトではエラーメッセージが表示されます。

## ローカルでの確認方法

1. 任意のローカルサーバーを立ち上げてブラウザで表示します。
   ```bash
   python -m http.server 8000
   ```
2. ブラウザで `http://localhost:8000` にアクセスして表示を確認します。

## ライセンス

MIT License
