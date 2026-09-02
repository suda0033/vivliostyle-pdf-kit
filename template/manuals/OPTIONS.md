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
3. `.\build-pdf.ps1 <文書名>`(Linux・Macは `./build-pdf.sh <文書名>`)で再生成します。

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
- 文字色やサイズを変えたい場合は、`styles/custom.css` に `@page { @bottom-left { ... } }` のように書いて調整してください(`styles/document.css` の `@page` ブロックが参考になります)。

## ドキュメント情報の表を資料冒頭に入れる(PDF入力フォーム付き)

本文1ページ目の冒頭に、プロジェクト名や承認欄などをまとめた罫線付きの表を置けます。
`pdf-field://` を書いたセルは**入力可能なPDFフォーム**になり、生成後のPDFにビューア(Acrobat Reader・Edge・Chrome等)から記入して保存できます。

最初の本文の原稿ファイル(例: `documents/project-document/01-overview.md`)の、最初の `# 見出し` より前に次のように書き、あとは通常どおりPDFを生成するだけです。左に文書情報、右に承認欄という2つの表が横に並びます。内容・列数は自由に変えられます。

動く見本が `documents/` にあります(`sample-doc-info-header/`: ヘッダー表と組み合わせ、`sample-doc-info-version/`: 版数の小箱+2行目に承認欄、`sample-cover-doc-info/`: 表紙の最上部に配置。ビルド方法は各フォルダの `README.md` を参照)。

```html
<div class="doc-info">
  <table>
    <tbody>
      <tr>
        <th>プロジェクト名</th>
        <th>ファイル名</th>
      </tr>
      <tr>
        <td>受注連携システム</td>
        <td>project-document.pdf</td>
      </tr>
    </tbody>
  </table>
  <table class="doc-info-right">
    <tbody>
      <tr>
        <th>作成</th>
        <th>更新</th>
        <th>確認</th>
      </tr>
      <tr>
        <td><a class="pdf-field" href="pdf-field://created-by"></a></td>
        <td><a class="pdf-field" href="pdf-field://updated-by"></a></td>
        <td><a class="pdf-field" href="pdf-field://reviewed-by"></a></td>
      </tr>
      <tr>
        <td><a class="pdf-field" href="pdf-field://created-date"></a></td>
        <td><a class="pdf-field" href="pdf-field://updated-date"></a></td>
        <td><a class="pdf-field" href="pdf-field://reviewed-date"></a></td>
      </tr>
    </tbody>
  </table>
</div>
```

- 記入欄にしたいセルには `<a class="pdf-field" href="pdf-field://名前"></a>` を書きます。`名前` は識別名で紙面には出ません(英数字推奨)。同じ名前のセルは入力値が共有されます。
- 固定で表示したい値は `<td>` に直接書きます。役割(作成・更新・確認など)の増減は列の増減だけです。
- 表に付けるクラスで幅と色を組み合わせられます(数値や色を変えるときは、`styles/document.css` の「ドキュメント情報の表」ブロックを参考に `styles/custom.css` で上書き)。
  - `doc-info-right`: 幅80mm+赤系の配色(承認欄向け)
  - `doc-info-small`: 幅26mm(全体の約15%。版数などの小さな箱)
  - `doc-info-full`: 次の行に送って全幅にする(表が幅を超えた場合も自動で折り返します)
  - `doc-info-accent`: 赤系の文字色・罫線色だけを付ける
- 表を1つだけ置きたい場合は、`<div>` を使わず `<table class="doc-info">` 1つで書けます。
- `<div class="doc-info">` の内側には**空行を入れないでください**(空行があるとそこでHTMLブロックが途切れます)。
- 表はページの先頭に配置され、直後の章見出しは改ページせず同じページに続きます。
- **表紙にも置けます。** `<section class="cover">` の内側(`# タイトル` より前)に書くと、表紙の最上部に配置されます(タイトルは中央のまま。見本: `documents/sample-cover-doc-info/`)。
- ビルドの最後に `Added 6 form field(s) to ...` と表示されれば、入力欄が埋め込まれています(`scripts/add-form-fields.js` が自動実行)。
- **PDFを再生成すると入力済みの値は消えます。** 記入は文書を確定するビルドの後に。
- 入力欄の文字サイズは9ptです。変える場合は `scripts/add-form-fields.js` の `'/Helv 9 Tf 0 g'` の `9` を調整します。

## ページヘッダーに表を入れる

各ページの上部余白に、プロジェクト名や作成者などをまとめた表を繰り返し表示できます。
スタイルは `styles/header-table.css` に用意済みで、次の2つの修正で有効になります。

1. `document.config.json` に `"styles"` を追加し、`styles/header-table.css` を含めます。

   ```json
   {
     "styles": ["styles/document.css", "styles/header-table.css"],
     ...
   }
   ```

2. `document.config.json` の `files` で**先頭にある原稿ファイル**(既定の文書では `documents/project-document/00-cover.md`)の先頭に、ヘッダー用の表を追加します。内容は自分の文書に合わせて書き換えてください。

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

あとは `.\build-pdf.ps1 <文書名>`(Linux・Macは `./build-pdf.sh <文書名>`)を実行すると、各ページの上部にこの表が入ります。
表紙(`<section class="cover">` のページ)には表示されません。

調整するときの注意:

- 表の行数を増やしたら、`styles/header-table.css` の `@page` の `margin-top: 34mm` も増やします。足りないと表が本文に重なります。
- 表の幅は `styles/header-table.css` の `.page-header table` の `width: 174mm`(A4幅210mm − 左右余白18mm×2)で指定しています。`styles/document.css` のページ余白を変えたらここも合わせます。

## 原稿フォルダを変更する

原稿のMarkdownを置くフォルダは、既定では**文書自身のフォルダ**(`document.config.json` と同じ場所)です。`"sourceDir"` で別のフォルダに変更できます。

```json
{
  "sourceDir": "docs/chapters"
}
```

- パスは、テンプレートのフォルダ(`build-pdf.ps1` がある場所)基準で書きます。サブフォルダ(`docs/chapters` など)も指定できます。
- `files` の各ファイルは `sourceDir` からの相対パスで解決されます。
- 原稿内の画像パスは原稿ファイルからの相対パスのままで動きます(ビルド時に自動で書き換えられます)。

## 複数の文書を作る

このキットは**1つの文書 = 1つのフォルダ**で、`documents/` に文書フォルダを増やすだけで複数の文書を作り分けられます。手順とパスの規則は [documents/README.md](../documents/README.md) を参照してください。

Windows(PowerShell):

```powershell
.\build-pdf.ps1 report        # documents/report/ をビルド
.\build-pdf.ps1 -All          # すべての文書をビルド
```

Linux・Mac:

```bash
./build-pdf.sh report         # documents/report/ をビルド
./build-pdf.sh --all          # すべての文書をビルド
```

- 一括ビルドは `documents/` 配下の文書フォルダ(`document.config.json` があるもの)をサブフォルダも含めて探索し、アルファベット順に1つずつビルドします。途中の文書が失敗するとそこで停止します。
- 文書はサブフォルダで分類できます(例: `documents/team-a/report/` → 文書名は `team-a/report`)。文書フォルダの中に別の文書は置けません。詳しくは [documents/README.md](../documents/README.md) を参照してください。
- `output` は文書ごとに別名にしてください(同じだと上書きされます)。一括ビルドでは開始前に重複をチェックし、重複があればエラーで停止します。
- 組版に使うCSSは設定の `"styles"` で指定できます(未指定なら `styles/document.css`)。`styles/themes/` のテーマに切り替える場合も、ここで `["styles/themes/theme-b-formal.css"]` のように指定します。文書ごとに別のCSSを指定できます。自分の調整用の `styles/custom.css` は、この指定の有無にかかわらず常に最後に読み込まれます。
- プレビュー(`npm run preview`)で文書を指定する場合は、環境変数 `DOC_CONFIG` に文書名を設定します(PowerShell: `$env:DOC_CONFIG="report"; npm run preview`。終わったら `Remove-Item Env:DOC_CONFIG`。Linux・Mac: `DOC_CONFIG=report npm run preview`)。

### 文書フォルダの場所を変える(kit.config.json)

プロジェクトの規約で文書の置き場所が決まっている場合(例: 仕様書は `docs/` に置く)、`documents/` の代わりに任意のフォルダを文書フォルダのルートにできます。テンプレートのフォルダにある `kit.config.json` の `"documentsDir"` を書き換えます。

```json
{
  "documentsDir": "docs/specs"
}
```

- 以後、`.\build-pdf.ps1 report` は `docs/specs/report/document.config.json` を、`-All` / `--all` は `docs/specs/` 配下の全文書をビルドします。フォルダの中の構造(1文書=1フォルダ、`document.config.json`+原稿)は変わりません。
- パスはテンプレートのフォルダ(`kit.config.json` がある場所)基準で、**テンプレートのフォルダ内**に限ります。`../` や絶対パスで外を指すとエラーになります(フォント・CSS・画像のコピーがテンプレートのフォルダ基準のため)。
- 各文書の `document.config.json` 内のパスの規則(テンプレートのフォルダ基準)も変わりません。

## HTMLとCSSで独自のレイアウトを作る

原稿のMarkdownにはHTMLをそのまま書けます。HTMLにクラス名を付け、そのクラスの見た目を `styles/custom.css` に書き足せば、Markdownの標準記法にないレイアウト(横並びの表、色付きの枠、幅を固定した箱など)を自由に作れます。上の「ドキュメント情報の表」や「注意書きボックス」もこの仕組みで作られています。

手順は2つです。

1. 原稿にクラス付きのHTMLを書く(例: 左右2段組)

   ```html
   <div class="two-columns">
     <div class="column">
       左の内容
     </div>
     <div class="column highlight">
       右の内容
     </div>
   </div>
   ```

2. `styles/custom.css` に、そのクラスの見た目を書く

   ```css
   .two-columns {
     display: flex;
     gap: 6mm;
   }

   .column {
     flex: 1;
     padding: 3mm;
     border: 0.5pt solid #b7c4cf;
   }

   .column.highlight {
     flex: 0 0 60mm;
     color: #7a2e2e;
     border-color: #c98c8c;
   }
   ```

書くときのルール:

- HTMLブロックの**前後には空行**を入れます。逆に、`<div>` で囲んだ**内側には空行を入れない**でください。空行があるとそこでHTMLブロックが途切れ、残りが通常のMarkdownとして処理されます。
- HTMLブロックの中ではMarkdown記法(`**太字**` や `- 箇条書き`)は効きません。中身もHTMLで書きます。
- 表は `<table>` で書けば、`styles/document.css` の `table` / `th` / `td` のスタイル(罫線など)が自動で付きます。
- 入力フォーム(`<a class="pdf-field" href="pdf-field://名前"></a>`)は、どのHTMLの中に書いても動きます。
- 幅や余白は `mm` で指定すると紙面の寸法どおりになります(A4の本文幅は174mm)。
- `styles/themes/` のテーマCSSに切り替えて使っている場合は、そのテーマファイルにも同じCSSを書きます。
