# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

これは浦川仁成のポートフォリオサイトです。GitHub Pagesでホスティングされる静的HTMLサイトで、バックエンドエンジニアとしてのスキルと経験を紹介しています。

## 技術スタック

- **HTML5**: セマンティックなマークアップ (`index.html`)
- **CSS3**: カスタムプロパティ、Flexbox、Grid、アニメーション (`css/style.css`)
- **Vanilla JavaScript**: フレームワークなしのピュアJS (`js/main.js`)
- **Python 3**: Zenn RSSフィード取得スクリプト (`scripts/fetch_zenn_feed.py`)
- **GitHub Actions**: 自動化ワークフロー (`.github/workflows/`)

## ディレクトリ構造

```
.
├── index.html              # メインHTMLファイル
├── css/
│   └── style.css           # スタイルシート（CSS変数でデザイントークン管理）
├── js/
│   └── main.js             # JavaScript（アニメーション、動的コンテンツ）
├── scripts/
│   └── fetch_zenn_feed.py  # Zenn RSSフィード取得スクリプト
├── data/
│   └── zenn-feed.json      # Zenn記事データ（自動生成）
├── images/                 # 画像アセット
└── .github/workflows/
    └── update-zenn-feed.yml # GitHub Actionsワークフロー
```

## 開発コマンド

### ローカルサーバー起動

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx serve
```

**VS Code Live Server:**
VS Codeで `index.html` を開き、右クリック →「Open with Live Server」

### Zennフィード手動更新

```bash
python3 scripts/fetch_zenn_feed.py
```

## アーキテクチャ

### CSS設計

- **CSS変数**: `:root` でデザイントークンを定義（色、タイポグラフィ、スペーシングなど）
- **ダークテーマ**: `--color-bg-primary: #0a0a0f` を基調としたダークテーマ
- **アクセントカラー**: グラデーション `#6366f1` → `#8b5cf6` → `#a855f7`
- **モバイルファースト**: メディアクエリで `max-width: 768px` などのブレークポイントを使用
- **カスタムカーソー**: デスクトップで `cursor: none` とJavaScriptによるカスタムカーソル実装

### JavaScriptアーキテクチャ

`js/main.js` は以下のモジュールで構成されています：

1. **`initLoader()`**: ローディングスクリーンの制御
2. **`initCursor()`**: カスタムカーソルエフェクト（デスクトップのみ）
3. **`initNavigation()`**: ナビゲーション（スクロール時のスタイル変更、モバイルメニュートグル、アクティブリンク更新）
4. **`initTypingEffect()`**: ヒーローセクションのタイピングアニメーション
5. **`initParticles()`**: 背景パーティクルアニメーション
6. **`initScrollAnimations()`**: IntersectionObserverによるスクロールアニメーション
7. **`initSkillBars()`**: スキルプログレスバーのアニメーション
8. **`initCountUp()`**: 統計数字のカウントアップアニメーション
9. **`fetchZennArticles()`**: `data/zenn-feed.json` から記事を取得して表示
10. **`initBackToTop()`**: トップへ戻るボタン

### Zenn記事連携システム

1. **RSS取得**: `scripts/fetch_zenn_feed.py` が Zenn RSSフィードを取得
2. **JSON変換**: フィードを `data/zenn-feed.json` に変換して保存
3. **表示**: `js/main.js` の `fetchZennArticles()` がJSONを読み込み、カードを動的生成
4. **自動更新**: GitHub Actionsが1時間ごとに実行（`cron: '0 * * * *'`）

## 主要セクション

| セクション | ID | 内容 |
|-----------|-----|------|
| Hero | `#hero` | プロフィール画像、タイピングエフェクト、CTAボタン |
| About | `#about` | 自己紹介、統計カード（年数、記事数、資格数） |
| Experience | `#experience` | 経歴タイムライン（会社、役職、期間） |
| Skills | `#skills` | 技術スキルカード（Go, Java, PostgreSQL等） |
| Certifications | `#certifications` | 資格カード |
| Articles | `#articles` | Zenn記事（動的取得） |
| Output | `#output` | SNSリンク（Zenn, Qiita, GitHub, X等） |

## カスタマイズポイント

### タイピングテキスト変更

`js/main.js` の `initTypingEffect()` 関数内の配列を編集：

```javascript
const texts = [
    'Backend Engineer',
    'Go Developer',
    // ... 追加・変更
];
```

### カラーテーマ変更

`css/style.css` の `:root` セクションでCSS変数を変更：

```css
:root {
    --color-accent-primary: #6366f1;
    --color-accent-secondary: #8b5cf6;
    --color-accent-tertiary: #a855f7;
}
```

### Zennユーザー名変更

`scripts/fetch_zenn_feed.py` の `FEED_URL` を変更：

```python
FEED_URL = "https://zenn.dev/USERNAME/feed"
```

## 注意事項

- `data/zenn-feed.json` は自動生成ファイルであり、手動で編集しないこと
- カスタムカーソルはモバイル（`max-width: 768px`）で非表示になり、標準カーソルに戻る
- 画像ファイルは `images/` ディレクトリに配置（`icon.png`, `zenn.svg`, `qiita.png`, `connpass.png`）
- GitHub Pagesではルートパス `/` がベースURLとなる
