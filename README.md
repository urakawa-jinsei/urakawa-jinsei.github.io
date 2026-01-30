# 浦川 仁成 - Portfolio Website

モダンでリッチなアニメーションを持つ、バックエンドエンジニアのポートフォリオサイトです。

🌐 **Live Site**: [https://urakawa-jinsei.github.io](https://urakawa-jinsei.github.io)

## ✨ Features

- **モダンなダークテーマ**: 目に優しいダークモードをベースにしたデザイン
- **リッチなアニメーション**: パーティクル背景、タイピングエフェクト、スクロールアニメーション
- **カスタムカーソル**: デスクトップでのインタラクティブなカーソルエフェクト
- **レスポンシブデザイン**: すべてのデバイスで最適な表示
- **Zenn記事連携**: Zenn APIから最新記事を自動取得・表示
- **SEO最適化**: メタタグ、OGP設定済み

## 📁 Project Structure

```
.
├── index.html          # メインHTMLファイル
├── css/
│   └── style.css       # スタイルシート
├── js/
│   └── main.js         # JavaScript
├── images/
│   └── icon.png        # プロフィールアイコン
└── README.md           # このファイル
```

## 🛠️ Technologies Used

- **HTML5**: セマンティックなマークアップ
- **CSS3**: カスタムプロパティ、Flexbox、Grid、アニメーション
- **Vanilla JavaScript**: フレームワークなしのピュアJS
- **Google Fonts**: Inter, Noto Sans JP
- **Font Awesome**: アイコン
- **Devicons**: スキルアイコン

## 🚀 Getting Started

### ローカルで実行

1. リポジトリをクローン
```bash
git clone https://github.com/urakawa-jinsei/urakawa-jinsei.github.io.git
cd urakawa-jinsei.github.io
```

2. ローカルサーバーを起動

**Python 3の場合:**
```bash
python3 -m http.server 8000
```

**Node.jsの場合:**
```bash
npx serve
```

**VS Code Live Serverの場合:**
VS Codeで `index.html` を開き、右クリック → 「Open with Live Server」

3. ブラウザでアクセス
```
http://localhost:8000
```

### GitHub Pagesでのホスティング

1. リポジトリ名を `<username>.github.io` 形式にする
2. メインブランチにプッシュ
3. Settings → Pages → Source を「Deploy from a branch」に設定
4. Branch を「main」、フォルダを「/ (root)」に設定
5. 数分後に `https://<username>.github.io` でアクセス可能

## 📝 Sections

| セクション | 説明 |
|-----------|------|
| **Hero** | プロフィール画像とタイピングエフェクト付きの自己紹介 |
| **About** | 自己PR、統計情報 |
| **Experience** | 経歴（タイムライン形式） |
| **Skills** | 技術スキル（プログレスバー付き） |
| **Certifications** | 資格情報 |
| **Articles** | Zennの最新記事（API連携） |
| **Output** | SNS・メディアリンク |

## 🔗 External APIs

- **Zenn API**: `https://zenn.dev/api/articles?username=urakawa_jinsei&order=latest`
  - 最新3記事を取得して表示

## 🎨 Customization

### カラーテーマの変更

`css/style.css` の `:root` セクションでCSS変数を変更:

```css
:root {
    --color-accent-primary: #6366f1;    /* メインアクセントカラー */
    --color-accent-secondary: #8b5cf6;  /* セカンダリカラー */
    --color-accent-tertiary: #a855f7;   /* ターシャリカラー */
}
```

### タイピングテキストの変更

`js/main.js` の `initTypingEffect` 関数内の配列を編集:

```javascript
const texts = [
    'Backend Engineer',
    'Go Developer',
    'Java Developer',
    // ... 追加・変更
];
```

## 📱 Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**浦川 仁成 (Urakawa Jinsei)**

- Zenn: [@urakawa_jinsei](https://zenn.dev/urakawa_jinsei)
- GitHub: [@urakawa-jinsei](https://github.com/urakawa-jinsei)
- X: [@jins8urakawa](https://x.com/jins8urakawa)

---

⭐ このリポジトリが参考になれば、スターをいただけると嬉しいです！
