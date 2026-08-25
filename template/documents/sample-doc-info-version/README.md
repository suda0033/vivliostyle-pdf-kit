# サンプル: ドキュメント情報の表(版数付き・2行) + フッターのコピーライト

本文1ページ目の冒頭に、ドキュメント情報の表を2行で置く文書のサンプルです。

- 1行目: 左に文書情報、右に**版数だけの小さな箱**(全体幅の約15%、赤文字・赤枠)
- 2行目: 承認欄(全幅・標準色)。PDFで記入できる入力フォーム
- フッター: 左下にコピーライト、中央にページ番号

ヘッダー表は使いません(ヘッダー表付きは `../sample-doc-info-header/` を参照)。

## ビルド方法

テンプレートのフォルダ(`build-pdf.ps1` がある場所)で、文書名を指定して実行します。

Windows(PowerShell):

```powershell
.\build-pdf.ps1 sample-doc-info-version
```

Linux・Mac:

```bash
./build-pdf.sh sample-doc-info-version
```

`dist/doc-info-version-sample.pdf` が生成されます。自分の文書には影響しません。

## 設定のポイント(document.config.json)

| キー | このサンプルでの値 | 意味 |
| --- | --- | --- |
| `footer.left` | `© 2026 開発チーム` | 左下のコピーライト。`center` は未指定なのでページ番号が出る |
| `output` | `dist/doc-info-version-sample.pdf` | 出力先(他の文書と別名) |
| `styles` | (未指定) | `styles/document.css` のみ。ヘッダー表は使わない |

## 表の組み方(01-overview.md)

`<div class="doc-info">` の中に表を3つ書いています。表は横に並び、幅を超えると次の行に折り返します。

| 表 | クラス | 役割 |
| --- | --- | --- |
| 文書情報 | (なし) | 残りの幅いっぱいに広がる |
| 版数 | `doc-info-small doc-info-accent` | `doc-info-small` が幅(約15%)、`doc-info-accent` が赤系の配色。クラスは組み合わせて使う |
| 承認欄 | `doc-info-full` | 次の行に送って全幅にする。色の指定なし=標準色 |

幅(`26mm`)や色は `styles/document.css` の「ドキュメント情報の表」ブロックで調整します。

## 自分の文書に組み込むには

1. `01-overview.md` の `<div class="doc-info">` 〜 `</div>` を、自分の最初の本文ファイルの最初の `# 見出し` より前にコピーする(表紙に置く例は `../sample-cover-doc-info/` を参照)。
2. 自分の文書の `document.config.json` の `"footer"` に `"left": "© 2026 〇〇"` を書く。
3. 表の中身(プロジェクト名、版数、承認欄の役割など)を書き換えて、通常どおり `build-pdf` を実行する。

## 注意

- `<div class="doc-info">` の内側に空行を入れない(空行があるとHTMLブロックが途切れる)。
- PDFを再生成すると承認欄に入力した値は消える。記入は文書を確定するビルドの後に行う。
- 詳細は `manuals/OPTIONS.md` の「ドキュメント情報の表を資料冒頭に入れる」「ページフッターに文字を入れる」を参照。
