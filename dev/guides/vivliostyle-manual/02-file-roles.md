# 必要ファイルの役割

VivliostyleでMarkdownをPDF文書化する場合に使う、主なファイルの役割をまとめます。

## 基本構成

最小構成は次の通りです。

```text
project/
  manuscript.md
  theme.css
  vivliostyle.config.js
  package.json
  dist/
```

| ファイル | 役割 |
| --- | --- |
| `manuscript.md` | 本文原稿 |
| `theme.css` | PDFの見た目を定義するCSS |
| `vivliostyle.config.js` | Vivliostyleのビルド設定 |
| `package.json` | コマンドと依存パッケージの管理 |
| `dist/` | 生成したPDFの出力先 |

## Markdown原稿

Markdownは文書の内容を管理するファイルです。

次のような内容を記述します。

- 見出し
- 本文
- 箇条書き
- 表
- コードブロック
- 画像
- 注記
- 章や節の構造

例:

```markdown
# はじめに

この文書は、Markdownで作成した原稿をPDF化する例です。

## 対象読者

- 開発者
- レビュアー
- 提出資料を作成する担当者
```

MarkdownはGitで差分管理しやすく、生成AIでも読み書きしやすい形式です。

## CSS

CSSはPDFの見た目を定義するファイルです。

主に次を制御します。

| 項目 | CSSで指定する内容 |
| --- | --- |
| ページサイズ | A4、B5、16:9など |
| 余白 | 上下左右のマージン |
| ページ番号 | ヘッダー、フッターへの出力 |
| フォント | 日本語フォント、文字サイズ、行間 |
| 見出し | サイズ、色、余白、罫線 |
| 改ページ | 章ごとの改ページ、表や図の分断防止 |
| 目次 | ページ番号参照、リーダー線 |
| 表 | 罫線、セル余白、折り返し |
| コード | 等幅フォント、背景色、折り返し |
| 画像 | 最大幅、高さ、改ページ抑制 |

例:

```css
@page {
  size: A4;
  margin: 22mm 18mm 20mm;
}

h1 {
  break-before: page;
  font-size: 20pt;
}
```

## Vivliostyle設定

`vivliostyle.config.js` は、どのMarkdownを、どのCSSで、どこへPDF出力するかを指定するファイルです。

例:

```js
module.exports = {
  title: '業務仕様書',
  author: '開発チーム',
  language: 'ja',
  size: 'A4',
  entry: ['manuscript.md'],
  theme: ['theme.css'],
  output: ['dist/document.pdf'],
  workspaceDir: '.vivliostyle',
};
```

| 項目 | 役割 |
| --- | --- |
| `title` | PDFメタデータのタイトル |
| `author` | PDFメタデータの著者 |
| `language` | 文書の言語 |
| `size` | ページサイズ |
| `entry` | 入力するMarkdown |
| `theme` | 適用するCSS |
| `output` | 出力するPDF |
| `workspaceDir` | Vivliostyleの作業ディレクトリ |

## package.json

`package.json` は、npmで実行するコマンドや依存パッケージを管理します。

例:

```json
{
  "scripts": {
    "build": "vivliostyle build",
    "preview": "vivliostyle preview"
  },
  "devDependencies": {
    "@vivliostyle/cli": "9.4.0"
  }
}
```

よく使うコマンドは次の通りです。

これらのコマンドは、`package.json` が置かれている文書プロジェクトのルートディレクトリで実行します。

| コマンド | 用途 |
| --- | --- |
| `npm run build` | PDFを生成する |
| `npm run preview` | ブラウザでプレビューする |

## 画像ファイル

Markdownから画像を参照すると、PDFにも画像として埋め込まれます。

```markdown
![画面遷移図](images/flow.svg)
```

PDF化に使いやすい画像形式は次の通りです。

| 形式 | 用途 |
| --- | --- |
| SVG | 図、フロー、Mermaid変換結果 |
| PNG | スクリーンショット |
| JPEG | 写真 |

図表やMermaidはSVGにすると、拡大しても劣化しにくく、PDF上でも読みやすくなります。

## Mermaidファイル

Mermaidを使う場合は、次の2通りがあります。

| 方法 | 特徴 |
| --- | --- |
| Markdown内にMermaidを書く | 原稿として管理しやすい |
| `.mmd` ファイルとして分離する | 図だけを個別に管理しやすい |

提出用PDFでは、MermaidをSVGに変換してからMarkdownに埋め込む方法が安定します。

```text
diagram.mmd -> diagram.svg -> PDF
```

## 複数Markdownで構成する場合

仕様書やマニュアルが大きくなる場合は、機能や章ごとにMarkdownを分割します。

```text
docs/
  00-cover.md
  01-overview.md
  02-feature-a.md
  03-feature-b.md
  90-appendix.md
```

この場合、PDF化前に1つのMarkdownへ結合するスクリプトを用意すると管理しやすくなります。

結合スクリプトでは、次の処理を行うことが多いです。

- ファイルを指定順に読み込む
- 目次を生成する
- 見出しにアンカーを付ける
- MermaidをSVGへ変換する
- 結合後の一時Markdownを出力する

## 出力PDF

PDFは成果物です。
内容を修正する場合はPDFを直接編集せず、MarkdownやCSSを更新して再生成します。

PDFをGit管理するかどうかは、運用方針で決めます。

| 方針 | 向いているケース |
| --- | --- |
| PDFをGit管理する | サンプルや提出物をそのままダウンロードさせたい |
| PDFをGit管理しない | CIで毎回生成する、成果物管理へアップロードする |

## 生成物と正本を分ける

文書運用では、正本と生成物を分けることが重要です。

| 種類 | 例 | 扱い |
| --- | --- | --- |
| 正本 | Markdown、CSS、設定ファイル | 編集する |
| 中間生成物 | 結合Markdown、変換済みSVG | 必要に応じて再生成する |
| 成果物 | PDF | 提出・共有する |

この区別を守ると、AIやGitを使った更新が安定します。
