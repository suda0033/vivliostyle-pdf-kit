# PDF文書作成手順

このフォルダは、Markdown原稿をVivliostyleでPDF化するための文書作成環境です。
利用するプロジェクトに、このフォルダごとコピーして使います。

フォルダ名は `docs` から自由に変えて構いません。スクリプトはフォルダ名に依存していないため、改名してもそのまま動きます。コピー先にすでに `docs/` がある場合は、中身を混ぜずに `pdf-docs/` など別名のフォルダとして入れてください。

利用者は、基本的に次の2つだけを使います。

## 初回セットアップ

PowerShellで、このREADMEが置かれているフォルダへ移動して、次を実行します。
`setup-docs.ps1` があるフォルダです。

```powershell
.\setup-docs.ps1
```

Node.jsが入っていることを確認し、必要なnpmパッケージをインストールします。
Mermaid図のレンダリングにChromiumを含むパッケージを使うため、初回インストールはサイズが大きく(数百MB)、時間がかかることがあります。

## PDF更新

Markdown原稿を編集した後、次を実行します。
PowerShellで、このREADMEが置かれているフォルダへ移動してから実行してください。
`build-pdf.ps1` があるフォルダです。

```powershell
.\build-pdf.ps1
```

PDFは `dist/` に出力されます。
VivliostyleはPDF生成時にローカルサーバーを使うため、複数のPDF生成コマンドを同時に実行しないでください。

## 編集する主なファイル

| ファイル/フォルダ | 用途 |
| --- | --- |
| `manuscript/` | Markdown原稿 |
| `assets/` | 画像、SVG、Mermaid元ファイル |
| `styles/document.css` | PDFの見た目 |
| `document.config.json` | 文書タイトル、出力先、結合順 |

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

`files` に書いた順番でPDFに結合されます。
目次に出したい章は `toc: true`、表紙など目次に出したくないファイルは `toc: false` にします。

目次ページ自体が不要な場合は、`document.config.json` のトップレベルに `"toc": false` を追加します(未指定なら目次ページを出します)。

```json
{
  "title": "プロジェクト文書",
  "toc": false,
  ...
}
```

目次ページは、通常 `files` の先頭ファイルの直後に入ります。位置を変えたい場合は、トップレベルに `"tocAfter"` で「このファイルの直後に入れる」を指定します。

```json
{
  "title": "プロジェクト文書",
  "tocAfter": "01-overview.md",
  ...
}
```

`files` に存在しないファイル名を `"tocAfter"` に指定するとエラーになります。

## 画像と図の入れ方

画像は `assets/` に置き、**原稿ファイルからの相対パス**で参照します。

```markdown
![システム構成図](../assets/system-diagram.png)
```

Mermaid図は原稿に ```` ```mermaid ```` のコードブロックとして直接書けば、PDF生成時に自動でSVGに変換されます。

## ページヘッダーに表を入れる(オプション)

各ページの上部余白に、プロジェクト名や作成者などをまとめた表を繰り返し表示できます。
スタイルは `styles/header-table.css` に用意済みで、次の2つの修正で有効になります。

1. `vivliostyle.config.js` の `theme` に `styles/header-table.css` を追加します。

   ```js
   theme: ['styles/document.css', 'styles/header-table.css'],
   ```

2. `document.config.json` の `files` で**先頭にある原稿ファイル**(通常は `manuscript/00-cover.md`)の先頭に、ヘッダー用の表を追加します。内容は自分の文書に合わせて書き換えてください。

   ```html
   <header class="page-header">
     <table>
       <tbody>
         <tr>
           <th>プロジェクト名</th>
           <td>受注連携システム</td>
           <th>文書番号</th>
           <td>SPEC-2026-001</td>
         </tr>
         <tr>
           <th>作成者</th>
           <td>開発チーム</td>
           <th>版数</th>
           <td>0.1</td>
         </tr>
       </tbody>
     </table>
   </header>
   ```

あとは `.\build-pdf.ps1` を実行すると、2ページ目以降の上部にこの表が入ります。
表紙(1ページ目)には表示されません。

調整するときの注意:

- 表の行数を増やしたら、`styles/header-table.css` の `@page` の `margin-top: 34mm` も増やします。足りないと表が本文に重なります。
- 表の幅は `styles/header-table.css` の `.page-header table` の `width: 174mm`(A4幅210mm − 左右余白18mm×2)で指定しています。`styles/document.css` のページ余白を変えたらここも合わせます。

## 基本ルール

- 内容を直す場合は `manuscript/` のMarkdownを編集します。
- 見た目を直す場合は `styles/document.css` を編集します。
- PDFを直接編集せず、MarkdownやCSSを更新してから再生成します。
- `node_modules/` や `.vivliostyle/` は生成物です。手で編集しません。
