# PDF文書作成手順

このフォルダは、Markdown原稿をVivliostyleでPDF化するための文書作成環境です。
利用するプロジェクトに、このフォルダごとコピーして使います。

フォルダ名は自由に変えて構いません(配布時の名前は `template` ですが、コピー先では `docs` など好きな名前にできます)。スクリプトはフォルダ名に依存していないため、改名してもそのまま動きます。コピー先にすでに同名のフォルダがある場合は、中身を混ぜずに `pdf-docs/` など別名のフォルダとして入れてください。

利用者は、基本的に次の2つだけを使います。

## 初回セットアップ

ターミナルで、このREADMEが置かれているフォルダへ移動して、次を実行します。
`setup-docs.ps1` / `setup-docs.sh` があるフォルダです。

Windows(PowerShell):

```powershell
.\setup-docs.ps1
```

Linux・Mac:

```bash
./setup-docs.sh
```

Node.jsが入っていることを確認し、必要なnpmパッケージをインストールします。
Mermaid図のレンダリングにChromiumを含むパッケージを使うため、初回インストールはサイズが大きく(数百MB)、時間がかかることがあります。

Linuxでは、PDF生成に使うChromiumが必要とする共有ライブラリ(libnss3など)が揃っているかも確認します。最小構成のLinux(Dockerコンテナ等)で不足している場合、Debian/Ubuntu系では自動でインストールを試みます(sudoのパスワードを求められることがあります)。その他のディストリビューションでは不足ライブラリの一覧と対処方法を表示します。

また、Linuxでは `fonts/` のフォント(同梱のNoto Sans JP)をユーザーフォントとして登録します。これはMermaid図の文字化け対策です(後述の「フォントを指定する」を参照)。

## PDF更新

Markdown原稿を編集した後、次を実行します。
ターミナルで、このREADMEが置かれているフォルダへ移動してから実行してください。
`build-pdf.ps1` / `build-pdf.sh` があるフォルダです。

Windows(PowerShell):

```powershell
.\build-pdf.ps1
```

Linux・Mac:

```bash
./build-pdf.sh
```

PDFは `dist/` に出力されます。
VivliostyleはPDF生成時にローカルサーバーを使うため、複数のPDF生成コマンドを同時に実行しないでください。

## 編集する主なファイル

| ファイル/フォルダ | 用途 |
| --- | --- |
| `manuscript/` | Markdown原稿 |
| `assets/` | 画像、SVG、Mermaid元ファイル |
| `fonts/` | 文書で使うフォント(Noto Sans JPを同梱) |
| `styles/document.css` | PDFの見た目 |
| `document.config.json` | 文書タイトル、出力先、結合順、フォント |

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

## フォントを指定する

既定では、同梱の[Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)(`fonts/NotoSansJP.ttf`、ライセンスは `fonts/OFL.txt`)を使う設定になっています。フォントはPDFに埋め込まれるため、Windows・Mac・Linuxのどこでビルドしても同じ見た目になり、日本語フォントの無い環境でも文字化けしません。

フォントは `document.config.json` の `"fonts"` で変えられます。

### 別のフォントファイルに差し替える

1. フォントファイル(`.ttf` / `.otf` / `.woff` / `.woff2`)を `fonts/` フォルダに置きます。
2. `document.config.json` の `"fonts"` を書き換えます。

   ```json
   {
     "title": "プロジェクト文書",
     "fonts": {
       "family": "BIZ UDGothic",
       "faces": [
         { "file": "fonts/BIZUDGothic-Regular.ttf", "weight": 400 },
         { "file": "fonts/BIZUDGothic-Bold.ttf", "weight": 700 }
       ]
     },
     ...
   }
   ```

   - `family`: 文書全体で使うフォント名。
   - `faces`: 使うフォントファイルの一覧。`weight` は `400`(標準)や `700`(太字)など。太字用ファイルも指定しておくと、見出しや `**強調**` に本物の太字が使われます。斜体フォントは `"style": "italic"` を追加します。同梱のNoto Sans JPのようなバリアブルフォントは `"weight": "100 900"` のように範囲で指定します。
3. `./build-pdf.ps1`(Linux・Macは `./build-pdf.sh`)で再生成します。

### OSにインストール済みのフォントを名前で指定する

フォントファイルを同梱せず、インストール済みのフォントを名前だけで指定することもできます。この場合 `faces` は不要です。

```json
{
  "fonts": { "family": "游明朝" }
}
```

### OS既定のフォントに戻す

`"fonts"` をまるごと削除すると、OSにインストール済みのフォント(Windowsなら游ゴシック)で組版されます。この場合、日本語フォントの無いLinuxでは文字化けするので注意してください。

### 注意点

- Mermaid図の中の文字は、この指定ではなく**システムフォント**で描画されます。日本語フォントの無いLinuxでは、`./setup-docs.sh` の実行時に `fonts/` のフォントがユーザーフォントとして登録され、Mermaid図にも反映されます。フォントを差し替えたときは `./setup-docs.sh` を再実行してください。
- フォントファイルには再配布条件があります。別のフォントをコミットして配布する場合はライセンスを確認してください。Noto Sans JPや[BIZ UDゴシック](https://fonts.google.com/specimen/BIZ+UDGothic)はSIL OFLで再配布できます。

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

あとは `.\build-pdf.ps1`(Linux・Macは `./build-pdf.sh`)を実行すると、2ページ目以降の上部にこの表が入ります。
表紙(1ページ目)には表示されません。

調整するときの注意:

- 表の行数を増やしたら、`styles/header-table.css` の `@page` の `margin-top: 34mm` も増やします。足りないと表が本文に重なります。
- 表の幅は `styles/header-table.css` の `.page-header table` の `width: 174mm`(A4幅210mm − 左右余白18mm×2)で指定しています。`styles/document.css` のページ余白を変えたらここも合わせます。

## 基本ルール

- 内容を直す場合は `manuscript/` のMarkdownを編集します。
- 見た目を直す場合は `styles/document.css` を編集します。
- PDFを直接編集せず、MarkdownやCSSを更新してから再生成します。
- `node_modules/` や `.vivliostyle/` は生成物です。手で編集しません。
