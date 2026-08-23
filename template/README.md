# PDF文書作成キット

このフォルダは、Markdown原稿をVivliostyleでPDF化するための文書作成環境です。
利用するプロジェクトに、このフォルダごとコピーして使います。

フォルダ名は自由に変えて構いません(配布時の名前は `template` ですが、コピー先では `docs` など好きな名前にできます)。スクリプトはフォルダ名に依存していないため、改名してもそのまま動きます。コピー先にすでに同名のフォルダがある場合は、中身を混ぜずに `pdf-docs/` など別名のフォルダとして入れてください。

## マニュアル

目的に応じて `manuals/` の中の該当するファイルを参照してください。

| 見るファイル | いつ見るか | 内容 |
| --- | --- | --- |
| [manuals/SETUP.md](manuals/SETUP.md) | **最初に1回だけ** | 初回セットアップ(`setup-docs` の実行) |
| [manuals/USAGE.md](manuals/USAGE.md) | **普段の作業** | 原稿の書き方、PDF更新(`build-pdf` の実行)、ファイル追加 |
| [manuals/OPTIONS.md](manuals/OPTIONS.md) | 必要になったら | オプション機能(目次の調整、フォント変更、ページフッター、ドキュメント情報の表、ページヘッダー表、HTML+CSSの独自レイアウト) |
| [manuals/SPEC.md](manuals/SPEC.md) | 挙動を知りたいとき | 記法と動作の詳細仕様(章の自動生成、ビルドの流れなど) |

はじめて使う場合は、[manuals/SETUP.md](manuals/SETUP.md) → [manuals/USAGE.md](manuals/USAGE.md) の順に読めば使い始められます。

## サンプル集

`samples/` に、機能を組み合わせた見本をサンプルごとのフォルダで置いています。各フォルダの `README.md` にビルド方法と設定のポイントを書いています。

| フォルダ | 内容 |
| --- | --- |
| [samples/doc-info-header/](samples/doc-info-header/) | 本文冒頭のドキュメント情報の表(承認欄はPDFで記入できる入力フォーム)+ 各ページのヘッダー表 |
| [samples/doc-info-version/](samples/doc-info-version/) | ドキュメント情報の表を2行構成に(1行目: 文書情報+版数の小箱、2行目: 承認欄)+ フッター左にコピーライト |
