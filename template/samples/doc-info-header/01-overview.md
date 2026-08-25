<!--
  ドキュメント情報の表(左: 文書情報 / 右: 承認欄)。
  最初の本文ファイルの、最初の「# 見出し」より前に置く(表紙に置く例は samples/cover-doc-info/ を参照)。
  承認欄の <a class="pdf-field" href="pdf-field://名前"></a> は、生成後のPDFで
  直接記入できる入力欄になる。<div> の内側に空行を入れないこと。
-->
<div class="doc-info">
  <table>
    <tbody>
      <tr>
        <th>プロジェクト名</th>
        <th>ファイル名</th>
      </tr>
      <tr>
        <td>受注連携システム</td>
        <td>doc-info-header-sample.pdf</td>
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

# 概要

このサンプルは、次の2つの機能を組み合わせた文書です。

- **ドキュメント情報の表**: このページの上部にある左右2つの表。左が文書の固定情報、右が承認欄で、承認欄の空欄はPDFビューア(Acrobat Reader・Edge・Chromeなど)からそのまま記入できます。
- **ヘッダー表**: ページ上部の余白に繰り返し表示される表。表紙を除くすべてのページに入ります(次のページで確認できます)。

## ドキュメント情報の表

- 左右に並べるには `<div class="doc-info">` の中に `<table>` を2つ書きます。
- 右の表に `class="doc-info-right"` を付けると、幅が80mmになり、文字色・罫線色が変わります。幅や色は `styles/document.css` で調整します。
- 記入させたいセルに `<a class="pdf-field" href="pdf-field://名前"></a>` を書きます。`名前` は入力欄の識別名で紙面には出ません。

<div class="note">

PDFを再生成すると入力済みの値は消えます。記入は文書を確定するビルドの後に行ってください。

</div>

# 自分の文書に組み込む

1. `document.config.json` の `"styles"` に `styles/header-table.css` を追加します(ヘッダー表を使う場合)。
2. `00-cover.md` の先頭にある `<header class="page-header">` 〜 `</header>` を、自分の文書の `files` の先頭ファイルの先頭にコピーします。
3. `01-overview.md` の先頭にある `<div class="doc-info">` 〜 `</div>` を、自分の文書の最初の本文ファイルの最初の `# 見出し` より前にコピーします。
4. 表の中身(プロジェクト名、役割の列など)を書き換えて、通常どおりPDFを生成します。

詳しい説明は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」「ページヘッダーに表を入れる」を参照してください。
