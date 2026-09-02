# キットのアップデート

新しいバージョンのキットが公開されたとき、使っているフォルダに反映する手順です。配布物は [GitHub Releases](https://github.com/suda0033/vivliostyle-pdf-kit/releases) の `template.zip` で、いま使っているバージョンは `package.json` の `"version"` で確認できます。

## 基本の考え方

このフォルダのファイルは「キットのファイル」と「自分のファイル」に分かれます。アップデートは**キットのファイルを新しいものに上書きし、自分のファイルには触らない**だけです。

| 分類 | 対象 | アップデート時 |
| --- | --- | --- |
| キットのファイル | `scripts/`、`vivliostyle.config.js`、`package.json`、`package-lock.json`、`setup-docs.ps1` / `setup-docs.sh`、`build-pdf.ps1` / `build-pdf.sh`、`styles/document.css`、`styles/header-table.css`、`styles/themes/`、`README.md`、`manuals/`、`documents/README.md`、`.gitignore` | **上書きする** |
| 見本 | `documents/sample-*/` | 残していれば上書き。削除済みなら入れなくてよい |
| 自分のファイル | `documents/` の自分の文書、`assets/`、`fonts/`(差し替えた場合)、`kit.config.json`、`styles/custom.css` | **触らない** |

見た目の変更を `styles/custom.css` に書いていれば(USAGE.md「基本ルール」参照)、キット側のCSSを上書きしても変更はそのまま残ります。`custom.css` は `"styles"` の指定にかかわらず常に最後に読み込まれるため、テーマを切り替えていても有効です。

## 手順

1. Releasesから新しい `template.zip` をダウンロードして展開します。
2. Releaseの変更内容(リリースノート)を読み、見た目に影響する変更や、原稿の書き方に関わる変更がないか確認します。
3. 展開したフォルダから「キットのファイル」を、使っているフォルダに**上書きコピー**します(フォルダ名を変えている場合はそのフォルダへ)。
4. `package.json` の `devDependencies` が変わっていた場合は、[SETUP.md](SETUP.md) の `setup-docs` を再実行します。バージョン番号だけの変更なら不要です。迷ったら再実行しても問題ありません(数分かかるだけです)。
5. [USAGE.md](USAGE.md) の手順で全文書のPDFを再生成し(`build-pdf.ps1 -All` / `build-pdf.sh --all`)、見た目が崩れていないか確認します。

## `document.css` やテーマを直接編集していた場合

そのまま上書きすると自分の変更が消えます。先に変更箇所を `styles/custom.css` に移してください。

1. 使っていたバージョンの `template.zip` をReleasesから取り直し、元の `document.css`(またはテーマCSS)と自分のファイルを比較して、変更した箇所を洗い出します。
2. 変更した箇所を、そのセレクタごと `styles/custom.css` に書き写します(`custom.css` は最後に読み込まれるので、同じセレクタの値はこちらが優先されます)。
3. `document.css` を新しい版で上書きし、PDFを再生成して見た目が変わっていないことを確認します。

一度この形にしておけば、次回からは上書きだけでアップデートできます。

## 注意

- `styles/document.css` はファイル名を変えないでください。`"styles"` を指定していない文書はこの名前を使います。
- `documents/` の場所を `kit.config.json` で変えている場合も、上書きするファイルは同じです(`documents/README.md` と見本は、使っていなければ入れなくてよい)。
- アップデート前に、使っているフォルダをまとめてバックアップ(またはGitでコミット)しておくと安心です。
