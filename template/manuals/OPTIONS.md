# オプション機能

必須ではない機能の設定方法をまとめています。基本の手順は [USAGE.md](USAGE.md) を参照してください。

## 目次ページを調整する

目次ページは、通常 `files` の先頭ファイルの直後に入ります。`document.config.json` のトップレベルで変更できます。

目次ページ自体が不要な場合は `"toc": false` を追加します(未指定なら目次ページを出します)。

```json
{
  "title": "プロジェクト文書",
  "toc": false,
  ...
}
```

位置を変えたい場合は `"tocAfter"` で「このファイルの直後に入れる」を指定します。`files` に存在しないファイル名を指定するとエラーになります。

```json
{
  "title": "プロジェクト文書",
  "tocAfter": "01-overview.md",
  ...
}
```

表紙を使わない文書などで、目次を文書の先頭(1ページ目)に置きたい場合は `"tocAfter": "start"` を指定します。

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

## ページフッターに文字を入れる

各ページの下部余白に、文書名や「社外秘」などの固定文字列を左寄せ・右寄せで表示できます。
`document.config.json` の `"footer"` に書くだけで、全ページ(表紙を除く)に入ります。

```json
{
  "footer": {
    "left": "社外秘",
    "right": "プロジェクト文書 v1.0"
  }
}
```

- `left` / `right`: 左下・右下に出す文字列。空文字 `""` または未指定なら何も出しません。
- `center`: 中央下の文字列。**未指定ならページ番号**が出ます(既定)。指定するとページ番号の代わりにその文字列が出ます。
- 表紙(`<section class="cover">` のページ)には、ページ番号と同様に表示されません。
- スタイルシート側が同じ位置に何かを出している場合(例: `styles/themes/theme-d-compact.css` は右下にページ番号)、この設定が優先されます。
- 文字色やサイズを変えたい場合は、`styles/document.css` の `@page` に `@bottom-left` などを直接書いて調整してください。

## ドキュメント情報の表を資料冒頭に入れる(PDF入力フォーム付き)

本文1ページ目の冒頭に、プロジェクト名や作成者などをまとめた罫線付きの表を置けます。
`pdf-field://` を書いたセルは**入力可能なPDFフォーム**になり、生成後のPDFにビューア(Acrobat Reader・Edge・Chrome等)から記入して保存できます。

最初の本文の原稿ファイル(例: `manuscript/01-overview.md`)の、最初の `# 見出し` より前に次のような表を書き、あとは通常どおりPDFを生成するだけです。内容・列数は自由に変えられます。

```html
<table class="doc-info">
  <tbody>
    <tr>
      <th colspan="3">プロジェクト名</th>
      <th colspan="3">ファイル名</th>
    </tr>
    <tr>
      <td colspan="3">受注連携システム</td>
      <td colspan="3">project-document.pdf</td>
    </tr>
    <tr>
      <th>作成者</th>
      <th>作成日</th>
      <th>更新者</th>
      <th>更新日</th>
      <th>確認者</th>
      <th>確認日</th>
    </tr>
    <tr>
      <td><a class="pdf-field" href="pdf-field://created-by"></a></td>
      <td><a class="pdf-field" href="pdf-field://created-date"></a></td>
      <td><a class="pdf-field" href="pdf-field://updated-by"></a></td>
      <td><a class="pdf-field" href="pdf-field://updated-date"></a></td>
      <td><a class="pdf-field" href="pdf-field://reviewed-by"></a></td>
      <td><a class="pdf-field" href="pdf-field://reviewed-date"></a></td>
    </tr>
  </tbody>
</table>
```

- 記入欄にしたいセルには `<a class="pdf-field" href="pdf-field://名前"></a>` を書きます。`名前` は識別名で紙面には出ません(英数字推奨)。同じ名前のセルは入力値が共有されます。
- 固定で表示したい値は `<td>` に直接書きます。役割(作成・更新・確認など)の増減は列の増減だけです。
- 表はページの先頭に配置され、直後の章見出しは改ページせず同じページに続きます。
- ビルドの最後に `Added 6 form field(s) to ...` と表示されれば、入力欄が埋め込まれています(`scripts/add-form-fields.js` が自動実行)。
- **PDFを再生成すると入力済みの値は消えます。** 記入は文書を確定するビルドの後に。
- 入力欄の文字サイズは9ptです。変える場合は `scripts/add-form-fields.js` の `'/Helv 9 Tf 0 g'` の `9` を調整します。

## ページヘッダーに表を入れる

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

あとは `.\build-pdf.ps1`(Linux・Macは `./build-pdf.sh`)を実行すると、各ページの上部にこの表が入ります。
表紙(`<section class="cover">` のページ)には表示されません。

調整するときの注意:

- 表の行数を増やしたら、`styles/header-table.css` の `@page` の `margin-top: 34mm` も増やします。足りないと表が本文に重なります。
- 表の幅は `styles/header-table.css` の `.page-header table` の `width: 174mm`(A4幅210mm − 左右余白18mm×2)で指定しています。`styles/document.css` のページ余白を変えたらここも合わせます。
