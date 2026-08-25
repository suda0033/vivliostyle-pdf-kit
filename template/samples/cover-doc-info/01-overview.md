# 概要

このサンプルは、**表紙の最上部にドキュメント情報の表**を置いた文書です。前のページ(表紙)の上部にある左右2つの表がそれです。

- 左の表: プロジェクト名・文書番号などの固定情報
- 右の表(`doc-info-right`): 承認欄。空欄はPDFビューア(Acrobat Reader・Edge・Chromeなど)からそのまま記入できます
- タイトルと作成者・作成日は、表とは無関係に従来どおり表紙の中央に配置されます

## 仕組み

`<div class="doc-info">` は本来「本文の新しいページの先頭に置く」設計(`break-before: page`)ですが、`styles/document.css` に表紙用の上書きが入っています。

```css
.cover .doc-info {
  break-before: auto;   /* 表紙の途中で改ページさせない */
  margin-bottom: auto;  /* 表を表紙の最上部に押し上げる */
}

.cover > .doc-info ~ :last-child {
  margin-bottom: auto;  /* 残りの空間を上下に半分ずつ配り、タイトルを中央に保つ */
}
```

このため、表紙(`<section class="cover">` の中)に doc-info の表を書くだけで最上部に配置されます。横並び・幅クラス(`doc-info-small` など)・強調色・PDF記入欄といった doc-info の機能は本文ページと同じように使えます。

# 自分の文書に組み込む

1. `00-cover.md` の `<div class="doc-info">` 〜 `</div>` を、自分の文書の表紙ファイルの `<section class="cover">` の内側(`# タイトル` より前)にコピーします。
2. 表の中身(プロジェクト名、承認欄の役割など)を書き換えて、通常どおりPDFを生成します。

本文1ページ目にも表を置きたい場合は `samples/doc-info-version/` や `samples/doc-info-header/` を参照してください(表紙と本文の両方に置くこともできます。承認欄の `pdf-field://名前` が同じ名前なら入力値は共有されます)。

詳しい説明は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」を参照してください。
