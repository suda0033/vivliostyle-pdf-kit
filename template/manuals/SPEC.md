# 記法と動作の仕様

普段の執筆には [USAGE.md](USAGE.md) の基本だけで足ります。このファイルは、細かい挙動を知りたいとき・思いどおりにならないときに参照する仕様メモです。

## ビルドの流れ

`build-pdf.ps1` / `build-pdf.sh`(実体は `npm run build`)は次の3段階で動きます。

1. `scripts/build-document.js` — 設定ファイルの `files` の順にMarkdownを結合し、章のセクション化・目次生成・画像パス書き換え・Mermaid変換を行って `.vivliostyle/generated/document-bundle.md` を作る。
2. `vivliostyle build` — バンドルをCSS組版してPDFを生成する。
3. `scripts/add-form-fields.js` — 原稿に `pdf-field://` リンクがあれば、その位置に入力フォームを追加する(無ければ何もしない)。

ビルド対象の文書は `build-pdf.ps1 <文書名>` / `build-pdf.sh <文書名>` で指定し、設定ファイルは `documents/<文書名>/document.config.json` です(文書フォルダのルートは `kit.config.json` の `"documentsDir"` で変更可。テンプレートのフォルダ内に限る)。内部では環境変数 `DOC_CONFIG` に文書名が入り、`scripts/resolve-config.js` が3段階すべてで同じ規則で設定ファイルに解決します(`npm run preview` にも効きます)。文書名は文書フォルダのルートからの相対パスで、サブフォルダによる分類(例: `team-a/report`)もできます。一括ビルド(`-All` / `--all`)は、`scripts/list-documents.js` が文書フォルダ配下を再帰的に探索して文書名を列挙・検証(`output` の重複チェック)した一覧を、ラッパーが1文書ずつ順にビルドします。`document.config.json` を持つフォルダより下は探索されず、文書フォルダの中に別の文書を置くことはできません(名前指定でもエラーになります)。組版に使うCSSは設定の `"styles"`(既定 `["styles/document.css"]`)が `vivliostyle.config.js` の `theme` になります。原稿フォルダは設定の `"sourceDir"`(既定は文書自身のフォルダ)で、`files` の各ファイルはそこからの相対パスで解決されます。

`.vivliostyle/generated/` は文書間で共有されるため、ビルドのたびに削除して作り直されます(前回ビルドした別文書のMermaid SVGなどが混ざりません)。

`.vivliostyle/` と `dist/` は生成物なので、手で編集しても次のビルドで消えます。

## 章の自動生成(h1の挙動)

- `# ` で始まるh1見出しを書くと、ビルド時にそのh1から次のh1の直前までが `<section class="chapter">` で自動的に囲まれます。章は `break-before: page` で必ず新しいページから始まり、見出しに章番号が付きます。
- **章とファイルは無関係**です。1つのファイルに複数の章を書けば章の数だけセクションが作られ、章ごとにファイルを分けても結果は同じです(ファイル分割は原稿整理のためだけのものです)。
- `files` で `"unnumbered": true` を付けたファイルは、`<section class="chapter unnumbered">` になり、章・節見出しに番号が付きません。目次にも番号なしで載ります。
- 見出しの番号(`1.2.3` など)は `##`〜`####` のネストに応じてCSSカウンタで振られます。

### 章のセクションを手書きする(自動生成の無効化)

ファイル内に `<section` タグを**1つでも**書くと、そのファイルでは章の自動生成が無効になり、手書きの構造がそのまま使われます。章にしたい部分は自分で `<section class="chapter">` 〜 `</section>` で囲んでください(番号なしの章は `class="chapter unnumbered"`)。表紙ファイルはこの仕組みで動いています。

## 表紙の仕組み

`<section class="cover">` で囲んだ内容は `page: cover` の名前付きページになり、ページ番号・フッター・ヘッダーが表示されません。表紙の有無は自由で、`files` から表紙ファイルを外せば1ページ目から通常のページになります。

## 目次の生成

- `files` で `"toc": true` を付けたファイルのh1〜h4見出しが目次に載ります。
- ビルド時に各見出しの直前へアンカー(`<span id="...">`)が挿入され、目次のページ番号はCSSの `target-counter()` で解決されます。したがって目次のページ番号は常に実ページと一致します。
- 目次ページの有無・位置の変更は [OPTIONS.md](OPTIONS.md) の「目次ページを調整する」を参照。

## 注意書きボックスの空行

`<div class="note">` の**直後と `</div>` の直前に空行が必要**です。MarkdownはHTMLブロックの内側を、空行があるときだけMarkdownとして処理するためです。空行がないと中身が素のテキストになります。

## 画像パスの扱い

原稿には**原稿ファイルからの相対パス**で書きます(例: `../assets/system-diagram.png`)。ビルド時に、結合先バンドル(`.vivliostyle/generated/`)から見たパスへ自動で書き換えられるため、原稿の置き場所を基準に書けば正しく表示されます。`http(s)://` や `/` で始まるパスは書き換えられません。

## Mermaid図の変換

原稿の ```` ```mermaid ```` コードブロックは、ビルド時に `mmdc`(mermaid-cli)でSVGに変換され、`.vivliostyle/generated/diagrams/` に出力されて画像として貼り込まれます。図中の文字はシステムフォントで描画されます(フォント指定との関係は [OPTIONS.md](OPTIONS.md) の「フォントを指定する > 注意点」を参照)。

## PDF入力フォームの仕組み

`<a class="pdf-field" href="pdf-field://名前"></a>` と書いた要素は、Chromiumの印刷時に位置矩形付きのリンク注釈としてPDFに残ります。ビルド後処理 `scripts/add-form-fields.js` がこの注釈を検出して削除し、同じ位置に入力フィールド(AcroForm)を重ねます。座標計算をしないため、表のレイアウトを変えてもズレません。使い方は [OPTIONS.md](OPTIONS.md) の「ドキュメント情報の表を資料冒頭に入れる」を参照。
