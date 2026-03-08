---
title: "GitHub Pages × Chirpyで爆速テックブログを作る"
description: "GitHub Pages と Chirpy テーマを使って、ゼロからテックブログを構築する手順を解説します。Dev Container を活用した開発環境のセットアップから、記事の書き方まで一通りカバーします。"
date: 2026-03-08 12:00:00 +0900
categories: [ブログ構築, GitHub Pages]
tags: [chirpy, jekyll, github-pages, dev-container, docker]
---

## TL;DR

- GitHub の Starter テンプレートを使えば、リポジトリ作成から数分でブログの土台が整う
- Dev Container を使うことで、ローカル環境を汚さずに Jekyll の開発環境を構築できる
- `_config.yml` を数カ所編集するだけで、自分のブログとして公開できる状態になる
- Favicon のカスタマイズや記事の書き方も公式ガイドに沿って対応できる

## はじめに

「テックブログを始めたいけれど、環境構築が面倒で後回しにしてしまっている」——そう思っていませんか？

本記事では、[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) テーマを使って GitHub Pages 上にテックブログを構築する手順を解説していきます。Chirpy は Jekyll ベースのブログテーマで、TOC・ダークモード・タグ・カテゴリといった機能をすぐに使えるのが特徴です。Dev Container を活用するため、Docker さえ用意すればローカル環境への Jekyll インストールは不要です。

## 1. サイトリポジトリを作成する

### Starter テンプレートを使う（推奨）

Chirpy 公式が用意している Starter テンプレートを使うのが最も手軽です。不要なファイルが含まれず、アップデートも追いやすいため、カスタマイズより**コンテンツ執筆に集中したい方に特に向いています**。

1. GitHub にサインインし、[chirpy-starter](https://github.com/cotes2020/chirpy-starter) にアクセスします。
2. **Use this template** ボタンをクリックし、**Create a new repository** を選択します。
3. リポジトリ名を `<username>.github.io` とします。`username` は自分の GitHub ユーザー名（**小文字**）に置き換えてください。

> リポジトリ名の `username` 部分は、必ず小文字の GitHub ユーザー名にしてください。大文字が混在すると GitHub Pages が正しく動作しません。
{: .prompt-warning }

## 2. 開発環境をセットアップする

### Dev Container を使う

Dev Container を使えば、Jekyll のインストールや Ruby のバージョン管理をローカル環境で行う必要がなくなります。Docker イメージの中に開発環境が閉じているため、クリーンに管理できるのが魅力です。

**必要なもの：**

| ツール                              | 用途                           |
| ----------------------------------- | ------------------------------ |
| Docker Desktop または Docker Engine | コンテナの実行基盤             |
| Visual Studio Code                  | エディタ                       |
| Dev Containers 拡張機能             | VS Code からコンテナに接続する |

**セットアップ手順：**

1. [Docker](https://www.docker.com/) をインストールします。
2. [VS Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) をインストールします。
3. リポジトリをクローンして、VS Code で開きます。
   - **Docker Desktop の場合：** VS Code を起動し、コマンドパレットから `Dev Containers: Clone Repository in Container Volume...` を実行してリポジトリをコンテナボリューム内にクローンします。
   - **Docker Engine（Linux）の場合：** 先にリポジトリをローカルにクローンしてから、VS Code でそのフォルダを開き、コマンドパレットから `Dev Containers: Reopen in Container` を実行します。
4. Dev Container のセットアップが完了するまで待ちます。初回は Docker イメージのダウンロードが発生するため、数分かかる場合があります。

> Dev Container のセットアップ中は VS Code のターミナルにログが流れます。エラーが出た場合は Docker が起動しているかを最初に確認してみてください。
{: .prompt-tip }

## 3. Jekyll サーバーを起動する

Dev Container のセットアップが完了したら、ターミナルで以下のコマンドを実行します。

```sh
bash tools/run.sh
```

起動後、ブラウザで `http://localhost:4000` にアクセスするとブログのプレビューが確認できます。ファイルを編集するとホットリロードで自動反映されます。

## 4. ブログの基本設定をする

### `_config.yml` を編集する

`_config.yml`{: .filepath} がブログ全体の設定ファイルです。最低限、以下の項目を自分の情報に書き換えましょう。

| 項目       | 説明                                   | 例                           |
| ---------- | -------------------------------------- | ---------------------------- |
| `url`      | ブログの公開URL                        | `https://username.github.io` |
| `avatar`   | サイドバーに表示するアイコン画像のパス | `/assets/img/avatar.webp`    |
| `timezone` | タイムゾーン                           | `Asia/Tokyo`                 |
| `lang`     | ブログの言語                           | `ja`                         |

```yaml
url: "https://username.github.io"
avatar: "/assets/img/avatar.webp"
timezone: "Asia/Tokyo"
lang: "ja"
```
{: file='_config.yml'}

> `url` の末尾にスラッシュをつけないでください。OGP や RSS フィードの URL 生成に影響します。
{: .prompt-warning }

### SNS・連絡先リンクを設定する

サイドバー下部に表示されるソーシャルリンクは `_data/contact.yml`{: .filepath} で管理されています。表示したい項目の `enable` を `true`、不要な項目は `false` にするだけで切り替えられます。

```yaml
- type: github
  icon: "fab fa-github"
  enable: true

- type: twitter
  icon: "fab fa-twitter"
  enable: false
```
{: file='_data/contact.yml'}

## 5. Favicon をカスタマイズする

デフォルトの Favicon を自分のアイコンに変更するには、公式ガイド [Customize the Favicon](https://chirpy.cotes.page/posts/customize-the-favicon/) に手順が詳しくまとまっています。

つまり、用意した画像から各サイズの Favicon ファイルを生成し、`assets/img/favicons/`{: .filepath} に配置するだけで完了します。

## 6. 記事を書く

記事の書き方（Front Matter の書き方・画像の挿入・コードブロックのオプション等）については、公式ガイド [Writing a New Post](https://chirpy.cotes.page/posts/write-a-new-post/) を参照してください。ファイル名の命名規則（`YYYY-MM-DD-title.md`）や Front Matter の各フィールドについて詳しく解説されています。

> 記事ファイルは `_posts/`{: .filepath} ディレクトリに配置します。ファイル名は `2026-03-08-my-first-post.md` のように日付を先頭につける命名規則が必須です。
{: .prompt-info }

## まとめ

- GitHub の Starter テンプレートからリポジトリを作成することで、設定済みの Chirpy 環境をすぐに手に入れられます
- Dev Container を使えば、Ruby や Jekyll のローカルインストールなしに開発を始められます
- `_config.yml` と `_data/contact.yml` を編集するだけで、自分らしいブログの基本設定が整います
- Favicon や記事の書き方は公式ガイドが充実しているので、迷わず参照できます

環境構築のハードルが下がったことで、ブログを始める理由がひとつ減ったかもしれません。あとは書くだけです。
