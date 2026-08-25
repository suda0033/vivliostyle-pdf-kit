# サンプル: ドキュメント情報の表 + ヘッダー表

本文1ページ目の冒頭に「文書情報の表」と「承認欄(PDFで記入できる入力フォーム)」を左右に並べ、
さらに各ページの上部余白に「ヘッダー表」を繰り返し表示する文書のサンプルです。

## ビルド方法

テンプレートのフォルダ(`build-pdf.ps1` がある場所)で、文書名を指定して実行します。

Windows(PowerShell):

```powershell
.\build-pdf.ps1 sample-doc-info-header
```

Linux・Mac:

```bash
./build-pdf.sh sample-doc-info-header
```

`dist/doc-info-header-sample.pdf` が生成されます。自分の文書には影響しません。

## 設定のポイント(document.config.json)

| キー | このサンプルでの値 | 意味 |
| --- | --- | --- |
| `output` | `dist/doc-info-header-sample.pdf` | 出力先。他の文書と別名にして上書きを防ぐ |
| `styles` | `["styles/document.css", "styles/header-table.css"]` | 組版に使うCSS。**ヘッダー表はここに `header-table.css` を足すだけで有効になる** |
| `files` | `00-cover.md`, `01-overview.md` | 結合する原稿。ヘッダー表は先頭ファイルに書く必要がある |

それ以外(`fonts`、`footer` など)は既定の文書(`documents/project-document/`)の設定と同じです。

## 原稿のどこに何を書いているか

| ファイル | 内容 |
| --- | --- |
| `00-cover.md` | 先頭に `<header class="page-header">` のヘッダー表、その下に表紙。ヘッダー表は `files` の**先頭ファイルのいちばん上**に置く(表紙ページには表示されない) |
| `01-overview.md` | 先頭に `<div class="doc-info">` の左右2表(右が承認欄)、その下に本文の章。ドキュメント情報の表は**最初の本文ファイルの、最初の `# 見出し` より前**に置く(表紙に置くと中央寄せのレイアウトで崩れる) |

## 自分の文書に組み込むには

1. 自分の文書の `document.config.json` に `"styles": ["styles/document.css", "styles/header-table.css"]` を追加する(ヘッダー表を使う場合)。
2. `00-cover.md` のヘッダー表ブロックを、自分の `files` の先頭ファイルの先頭にコピーする。
3. `01-overview.md` の `<div class="doc-info">` 〜 `</div>` を、自分の最初の本文ファイルの最初の `# 見出し` より前にコピーする。
4. 表の中身(プロジェクト名、承認欄の役割など)を書き換えて、通常どおり `build-pdf` を実行する。

## 注意

- `<div class="doc-info">` の内側に空行を入れない(空行があるとHTMLブロックが途切れる)。
- ヘッダー表の行数を増やしたら `styles/header-table.css` の `@page` の `margin-top: 34mm` も増やす(足りないと本文と重なる)。
- PDFを再生成すると承認欄に入力した値は消える。記入は文書を確定するビルドの後に行う。
- 詳細は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」「ページヘッダーに表を入れる」「複数の文書を作る」を参照。
