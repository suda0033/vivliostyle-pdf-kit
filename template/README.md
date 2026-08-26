# PDF文書作成キット

このフォルダは、Markdown原稿をVivliostyleでPDF化するための文書作成環境です。
利用するプロジェクトに、このフォルダごとコピーして使います。

フォルダ名は自由に変えて構いません(配布時の名前は `template` ですが、コピー先では `docs` など好きな名前にできます)。スクリプトはフォルダ名に依存していないため、改名してもそのまま動きます。コピー先にすでに同名のフォルダがある場合は、中身を混ぜずに `pdf-docs/` など別名のフォルダとして入れてください。

## フォルダ構成

```text
(このフォルダ)
├── README.md             # このファイル(マニュアルの案内)
├── manuals/              # マニュアル(下の表を参照)
├── setup-docs.ps1        # 初回セットアップ(Windows / PowerShell)
├── setup-docs.sh         # 初回セットアップ(Linux・Mac / シェル)
├── build-pdf.ps1         # PDF生成(Windows / PowerShell)。文書名か -All を指定して実行
├── build-pdf.sh          # PDF生成(Linux・Mac / シェル)。文書名か --all を指定して実行
├── kit.config.json       # キット全体の設定(文書フォルダの場所 documentsDir の変更など)
├── documents/            # 文書フォルダ(1文書=1フォルダ。原稿Markdown+document.config.json)
│   ├── README.md             # 文書の増やし方とパスの規則
│   ├── project-document/     # 既定の文書(名前・中身は自由に変えてよい)
│   └── sample-*/             # 機能の見本(README付き。不要ならフォルダごと削除可)
├── assets/               # 文書をまたいで使う画像など(原稿からの相対パスで参照)
├── fonts/                # 文書で使うフォント(Noto Sans JPを同梱。ライセンスは OFL.txt)
├── styles/               # PDFの見た目のCSS
│   ├── document.css          # 標準スタイル
│   ├── header-table.css      # ページヘッダー表を使う場合に追加するCSS
│   └── themes/               # 差し替え用テーマCSS
├── scripts/              # ビルドスクリプト本体(通常は編集不要)
├── vivliostyle.config.js # Vivliostyleへの橋渡し(通常は編集不要)
├── package.json          # 依存パッケージの定義(npmが使用)
├── package-lock.json     # 依存パッケージのバージョン固定(npmが使用)
├── .gitignore            # 生成物をコミット対象から外す設定
├── node_modules/         # [生成物] 依存パッケージ(setup-docsが作成)
├── .vivliostyle/         # [生成物] ビルドの中間ファイル(ビルドごとに作り直される)
└── dist/                 # [生成物] 出力されたPDF
```

`[生成物]` のフォルダは手で編集せず、Gitにもコミットしません(`.gitignore` で除外済み)。普段編集するのは `documents/` 配下と、見た目を変えるときの `styles/` だけです。文書フォルダの場所を `documents/` から変える方法は [manuals/OPTIONS.md](manuals/OPTIONS.md) の「文書フォルダの場所を変える」を参照してください。

## マニュアル

目的に応じて `manuals/` の中の該当するファイルを参照してください。

| 見るファイル | いつ見るか | 内容 |
| --- | --- | --- |
| [manuals/SETUP.md](manuals/SETUP.md) | **最初に1回だけ** | 初回セットアップ(`setup-docs` の実行) |
| [manuals/USAGE.md](manuals/USAGE.md) | **普段の作業** | 原稿の書き方、PDF更新(`build-pdf` の実行)、ファイル追加 |
| [manuals/OPTIONS.md](manuals/OPTIONS.md) | 必要になったら | オプション機能(目次の調整、フォント変更、ページフッター、ドキュメント情報の表、ページヘッダー表、複数の文書、HTML+CSSの独自レイアウト) |
| [manuals/SPEC.md](manuals/SPEC.md) | 挙動を知りたいとき | 記法と動作の詳細仕様(章の自動生成、ビルドの流れなど) |

はじめて使う場合は、[manuals/SETUP.md](manuals/SETUP.md) → [manuals/USAGE.md](manuals/USAGE.md) の順に読めば使い始められます。

## 文書フォルダとサンプル集

文書は**1つの文書 = 1つのフォルダ**で `documents/` に置きます([documents/README.md](documents/README.md) 参照)。既定の文書は `documents/project-document/` です。

`documents/sample-*/` に、機能を組み合わせた見本を置いています。各フォルダの `README.md` にビルド方法と設定のポイントを書いています(不要になったらフォルダごと削除して構いません)。

| フォルダ | 内容 |
| --- | --- |
| [documents/sample-doc-info-header/](documents/sample-doc-info-header/) | 本文冒頭のドキュメント情報の表(承認欄はPDFで記入できる入力フォーム)+ 各ページのヘッダー表 |
| [documents/sample-doc-info-version/](documents/sample-doc-info-version/) | ドキュメント情報の表を2行構成に(1行目: 文書情報+版数の小箱、2行目: 承認欄)+ フッター左にコピーライト |
| [documents/sample-cover-doc-info/](documents/sample-cover-doc-info/) | ドキュメント情報の表を表紙の最上部に配置(タイトルは中央のまま。承認欄はPDFで記入できる入力フォーム) |
