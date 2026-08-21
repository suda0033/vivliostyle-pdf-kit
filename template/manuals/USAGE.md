# 日常の使い方(原稿の書き方とPDF更新)

原稿を書いてPDFを作る、普段の作業のマニュアルです。初回のみ [SETUP.md](SETUP.md) のセットアップが必要です。

## PDF更新

Markdown原稿を編集した後、次を実行します。
ターミナルで、`build-pdf.ps1` / `build-pdf.sh` があるフォルダ(README.mdと同じ場所)へ移動してから実行してください。

Windows(PowerShell):

```powershell
.\build-pdf.ps1
```

Linux・Mac:

```bash
./build-pdf.sh
```

`Permission denied` になる場合は `sh build-pdf.sh` を実行してください。

PDFは `dist/` に出力されます。
VivliostyleはPDF生成時にローカルサーバーを使うため、複数のPDF生成コマンドを同時に実行しないでください。

## 編集する主なファイル

| ファイル/フォルダ | 用途 |
| --- | --- |
| `manuscript/` | Markdown原稿 |
| `assets/` | 画像、SVG、Mermaid元ファイル |
| `fonts/` | 文書で使うフォント(Noto Sans JPを同梱) |
| `styles/document.css` | PDFの見た目 |
| `document.config.json` | 文書タイトル、出力先、結合順、フォント、フッター |

## Markdownファイルを追加した場合

`manuscript/` に新しいMarkdownファイルを追加しただけでは、PDFには含まれません。
PDFに含めるには、`document.config.json` の `files` に追加します。

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

- ファイル名は自由です(サンプルでは `manuscript/00-cover.md`)。表紙は目次に不要なので、`files` では `"toc": false` にします。
- **表紙が不要な場合は、`files` から表紙ファイルを外すだけ**です。1ページ目から普通にページ番号・ヘッダーが表示されます。目次を文書の先頭に置きたい場合は `"tocAfter": "start"` を併せて指定してください。

### 注意書きボックス

`<div class="note">` 〜 `</div>` で囲むと、枠付きの注意書きになります。**タグの直後・直前に空行が必要**です(空行がないと中身がMarkdownとして処理されません)。

```markdown
<div class="note">

PDFを直接編集せず、Markdownを更新してから再生成します。

</div>
```

章の自動生成の詳しい挙動や、セクション構造を自分で手書きする方法(上級者向け)は [SPEC.md](SPEC.md) を参照してください。

## 画像と図の入れ方

画像は `assets/` に置き、**原稿ファイルからの相対パス**で参照します。

```markdown
![システム構成図](../assets/system-diagram.png)
```

Mermaid図は原稿に ```` ```mermaid ```` のコードブロックとして直接書けば、PDF生成時に自動でSVGに変換されます。

## 基本ルール

- 内容を直す場合は `manuscript/` のMarkdownを編集します。
- 見た目を直す場合は `styles/document.css` を編集します。
- PDFを直接編集せず、MarkdownやCSSを更新してから再生成します。
- `node_modules/` や `.vivliostyle/` は生成物です。手で編集しません。
