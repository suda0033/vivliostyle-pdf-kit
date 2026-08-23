<!--
  ドキュメント情報の表。1行目は左右に分かれ(左: 文書情報 / 右: 版数の小さな箱)、
  2行目は承認欄(全幅・標準色)。承認欄の <a class="pdf-field" ...> は
  生成後のPDFで直接記入できる入力欄になる。<div> の内側に空行を入れないこと。
    doc-info-small  … 幅を全体の約15%にする
    doc-info-accent … 赤系の文字色・罫線色にする
    doc-info-full   … 次の行に送って全幅にする
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
        <td>doc-info-version-sample.pdf</td>
      </tr>
    </tbody>
  </table>
  <table class="doc-info-small doc-info-accent">
    <tbody>
      <tr>
        <th>版数</th>
      </tr>
      <tr>
        <td>1.0</td>
      </tr>
    </tbody>
  </table>
  <table class="doc-info-full">
    <tbody>
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
</div>

# 概要

このサンプルは、本文1ページ目の冒頭にドキュメント情報の表を2行で置き、ページ下部にコピーライトを入れた文書です。

- **1行目**: 左が文書の固定情報、右が版数だけの小さな箱(赤文字・赤枠)。
- **2行目**: 承認欄。作成・更新・確認の担当者と日付を、PDFビューア(Acrobat Reader・Edge・Chromeなど)からそのまま記入できます。
- **フッター**: 左下にコピーライト、中央にページ番号(`document.config.json` の `"footer"` で設定)。

## 表の組み方

- `<div class="doc-info">` の中に表を3つ書いています。表は横に並び、幅を超えると次の行に折り返します。
- 版数の箱は `class="doc-info-small doc-info-accent"`。`doc-info-small` が幅(約15%)、`doc-info-accent` が赤系の配色です。幅や色は `styles/document.css` で調整します。
- 承認欄は `class="doc-info-full"` で次の行に送り、全幅にしています。色の指定はないので標準色です。

<div class="note">

PDFを再生成すると承認欄に入力した値は消えます。記入は文書を確定するビルドの後に行ってください。

</div>

# 自分の文書に組み込む

1. `01-overview.md` の先頭にある `<div class="doc-info">` 〜 `</div>` を、自分の最初の本文ファイルの最初の `# 見出し` より前にコピーします(表紙には置きません)。
2. `document.config.json` の `"footer"` に `"left": "© 2026 〇〇"` のようにコピーライトを書きます。
3. 表の中身(プロジェクト名、版数、承認欄の役割など)を書き換えて、通常どおりPDFを生成します。

詳しい説明は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」「ページフッターに文字を入れる」を参照してください。
