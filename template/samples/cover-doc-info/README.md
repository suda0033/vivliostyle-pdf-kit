# サンプル: 表紙にドキュメント情報の表

**表紙の最上部**に、プロジェクト名や承認欄をまとめた表を置く文書のサンプルです。

- 表紙上部: 左に文書情報、右に承認欄(`doc-info-right`)。承認欄はPDFで記入できる入力フォーム
- タイトル・作成者・作成日は従来どおり表紙の中央に配置される
- 本文ページに表は置かない(本文1ページ目に置く例は `samples/doc-info-version/`、ヘッダー表と組み合わせる例は `samples/doc-info-header/` を参照)

## ビルド方法

テンプレートのフォルダ(`build-pdf.ps1` がある場所)で、設定ファイルを指定して実行します。

Windows(PowerShell):

```powershell
.\build-pdf.ps1 -Config samples/cover-doc-info/document.config.json
```

Linux・Mac:

```bash
./build-pdf.sh samples/cover-doc-info/document.config.json
```

`dist/cover-doc-info-sample.pdf` が生成されます。自分の文書(`manuscript/` と `document.config.json`)には影響しません。

## 設定のポイント(document.config.json)

| キー | このサンプルでの値 | 意味 |
| --- | --- | --- |
| `sourceDir` | `samples/cover-doc-info` | 原稿フォルダ |
| `output` | `dist/cover-doc-info-sample.pdf` | 出力先(既定の文書と別名) |
| `styles` | (未指定) | `styles/document.css` のみ。追加CSSは不要 |

## 表の組み方(00-cover.md)

`<section class="cover">` の**内側**、`# タイトル` より前に `<div class="doc-info">` を書くだけです。追加のCSSやクラスは要りません。`styles/document.css` に入っている表紙用の上書き(`.cover .doc-info` のブロック)が、

1. doc-info 標準の「新しいページの先頭に置く」挙動を打ち消して表紙が2ページに割れるのを防ぎ、
2. 表を表紙の最上部に押し上げつつ、タイトル群を中央に保ちます。

横並び・幅クラス(`doc-info-small` / `doc-info-full` など)・強調色(`doc-info-accent`)・PDF記入欄は、本文ページに置く場合と同じように使えます。

## 自分の文書に組み込むには

1. `00-cover.md` の `<div class="doc-info">` 〜 `</div>` を、自分の表紙ファイルの `<section class="cover">` の内側(`# タイトル` より前)にコピーする。
2. 表の中身(プロジェクト名、承認欄の役割など)を書き換えて、通常どおり `build-pdf` を実行する。

## 注意

- `<div class="doc-info">` の内側に空行を入れない(空行があるとHTMLブロックが途切れる)。
- PDFを再生成すると承認欄に入力した値は消える。記入は文書を確定するビルドの後に行う。
- 詳細は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」を参照。
