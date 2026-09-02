# 日常の使い方(原稿の書き方とPDF更新)

原稿を書いてPDFを作る、普段の作業のマニュアルです。初回のみ [SETUP.md](SETUP.md) のセットアップが必要です。

## PDF更新

Markdown原稿を編集した後、**文書名**(`documents/` のフォルダ名)を指定して実行します。
ターミナルで、`build-pdf.ps1` / `build-pdf.sh` があるフォルダ(README.mdと同じ場所)へ移動してから実行してください。

Windows(PowerShell):

```powershell
.\build-pdf.ps1 project-document
```

Linux・Mac:

```bash
./build-pdf.sh project-document
```

すべての文書をまとめてビルドする場合は `-All`(Linux・Macは `--all`)を指定します。

```powershell
.\build-pdf.ps1 -All
```

```bash
./build-pdf.sh --all
```

`Permission denied` になる場合は `sh build-pdf.sh <文書名>` を実行してください。

PDFは `dist/` に出力されます。
VivliostyleはPDF生成時にローカルサーバーを使うため、複数のPDF生成コマンドを同時に実行しないでください(一括ビルドはこのため1文書ずつ順番に実行されます)。

文書の追加方法は [OPTIONS.md](OPTIONS.md) の「複数の文書を作る」を参照してください。

## 編集する主なファイル

| ファイル/フォルダ | 用途 |
| --- | --- |
| `documents/<文書名>/` | 文書ごとのフォルダ(Markdown原稿+設定。[documents/README.md](../documents/README.md) 参照) |
| `documents/<文書名>/document.config.json` | 文書タイトル、出力先、結合順、フォント、フッター |
| `assets/` | 画像、SVG、Mermaid元ファイル |
| `fonts/` | 文書で使うフォント(Noto Sans JPを同梱) |
| `styles/document.css` | PDFの見た目 |

## Markdownファイルを追加した場合

文書フォルダに新しいMarkdownファイルを追加しただけでは、PDFには含まれません。
PDFに含めるには、同じフォルダの `document.config.json` の `files` に追加します。

例:

```json
{
  "files": [
    { "file": "00-cover.md", "toc": false },
    { "file": "01-overview.md", "toc": true },
    { "file": "02-operation.md", "toc": true },
    { "file": "03-new-feature.md", "toc": true }
  ]
}
```

`files` に書いた順番でPDFに結合されます。各ファイルには次のオプションを指定できます。

| オプション | 意味 |
| --- | --- |
| `"toc": true / false` | このファイルの見出しを目次に出すか。表紙などは `false` |
| `"unnumbered": true` | このファイル内の章・見出しを番号なしにする(付録など)。省略時は番号あり |

目次ページの有無や位置の変更は [OPTIONS.md](OPTIONS.md) の「目次ページを調整する」を参照してください。

## 原稿Markdownで使える記法

原稿は普通のMarkdownで書けます。加えて、次の記法を認識します。

| 記法 | 意味 |
| --- | --- |
| `# 見出し`(h1) | **章**の始まり。自動で改ページし、章番号が付く |
| `##` 〜 `####` | 節見出し。`1.2` のような節番号が付く |
| `<section class="cover">` 〜 `</section>` | このページを**表紙**にする |
| `<div class="note">` 〜 `</div>` | 注意書きボックス |
| ```` ```mermaid ```` | Mermaid図(ビルド時に自動でSVG化。「画像と図の入れ方」参照) |

### 章(h1見出し)

`# ` で始まるh1見出しを書くと、そこから新しい章になります。章の前で自動的に改ページされ、見出しに章番号が付きます。

- 章とファイルは無関係です。1つのファイルに複数の章を書いても、章ごとにファイルを分けても構いません(ファイル分割は原稿整理のためだけのものです)。
- 「付録」など番号を付けたくない章は、`document.config.json` の `files` でそのファイルに `"unnumbered": true` を付けます。ファイル内の見出しが本文・目次とも番号なしになります。

### 表紙

表紙にしたいページは、内容全体を `<section class="cover">` 〜 `</section>` で囲みます(MarkdownにはHTMLをそのまま書けます)。囲んだページは表紙レイアウトになり、ページ番号やヘッダーが表示されません。

```markdown
<section class="cover">

# プロジェクト文書

作成者: 開発チーム

</section>
```

- ファイル名は自由です(既定の文書では `documents/project-document/00-cover.md`)。表紙は目次に不要なので、`files` では `"toc": false` にします。
- **表紙が不要な場合は、`files` から表紙ファイルを外すだけ**です。1ページ目から普通にページ番号・ヘッダーが表示されます。目次を文書の先頭に置きたい場合は `"tocAfter": "start"` を併せて指定してください。

### 注意書きボックス

`<div class="note">` 〜 `</div>` で囲むと、枠付きの注意書きになります。**タグの直後・直前に空行が必要**です(空行がないと中身がMarkdownとして処理されません)。

```markdown
<div class="note">

PDFを直接編集せず、Markdownを更新してから再生成します。

</div>
```

章の自動生成の詳しい挙動や、セクション構造を自分で手書きする方法(上級者向け)は [SPEC.md](SPEC.md) を参照してください。
Markdownにない見た目(横並び、色付きの枠など)をHTMLとCSSで作る方法は [OPTIONS.md](OPTIONS.md) の「HTMLとCSSで独自のレイアウトを作る」を参照してください。

## 画像と図の入れ方

画像は `assets/` に置き、**原稿ファイルからの相対パス**で参照します。

```markdown
![システム構成図](../assets/system-diagram.png)
```

Mermaid図は原稿に ```` ```mermaid ```` のコードブロックとして直接書けば、PDF生成時に自動でSVGに変換されます。

### Mermaid図が大きくなりすぎないようにする

A4の本文が入る範囲は**幅174mm × 高さ255mm**(既定の余白の場合)です。図がこれより大きいときは、はみ出して切れることのないよう**縦横比を保ったまま自動で縮小**されます。ただし縮小されるほど図中の文字は小さくなるため、大きすぎる図は「PDFには載っているが読めない」状態になります。

目安は次のとおりです。

| 方向 | 目安 | 超えると |
|---|---|---|
| 縦(`flowchart TD`) | ノード15個程度まで | 幅が細くなり文字が小さくなる |
| 横(`flowchart LR`) | ノード6〜8個程度まで | **高さが潰れてほぼ判読不能になる** |

**横方向は特に影響が大きい**ので注意してください。ノードを24個横に並べた図は幅が本文の40倍近くになり、縮小の結果、高さ2mm弱の線のようになって内容がまったく読めなくなります。

大きくなってしまうときは、次のいずれかで調整します。

- 図を複数のブロックに分割する(工程ごと、フェーズごとなど)
- `flowchart LR` を `flowchart TD` に変えて縦に流す
- ノードのラベルを短くする、または `<br>` で折り返して1行を短くする

また、図はページの途中で分割されないため、**図の直前に長い本文があると図が次のページに送られ、前のページの下部が空きます**。見出しと数段落のあとに置く程度なら同じページに収まるよう縮小の上限を決めていますが、空きが気になるときは図を段落の前に移す、または図を分割してください。

## 基本ルール

- 内容を直す場合は `documents/<文書名>/` のMarkdownを編集します。
- 見た目を直す場合は `styles/document.css` を編集します。
- PDFを直接編集せず、MarkdownやCSSを更新してから再生成します。
- `node_modules/` や `.vivliostyle/` は生成物です。手で編集しません。
