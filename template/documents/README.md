# documents/ — 文書フォルダ

このキットでは、**1つの文書 = 1つのフォルダ**です。各フォルダに設定ファイル `document.config.json` とMarkdown原稿を置きます。

```text
documents/
├── project-document/        # 文書「プロジェクト文書」(このフォルダ名がビルド時の文書名)
│   ├── document.config.json # タイトル、出力先、結合順、フォント、フッター
│   ├── 00-cover.md          # 原稿
│   └── ...
└── sample-*/                # 機能の見本(不要になったらフォルダごと削除してよい)
```

## ビルド方法

フォルダ名がそのまま文書名になります。テンプレートのフォルダ(README.mdと同じ場所)から実行します。

```powershell
.\build-pdf.ps1 project-document   # Windows(PowerShell)
.\build-pdf.ps1 -All               # すべての文書をビルド
```

```bash
./build-pdf.sh project-document    # Linux・Mac
./build-pdf.sh --all               # すべての文書をビルド
```

## 文書を追加する

1. `documents/` に新しいフォルダを作ります(例: `documents/report/`)。フォルダ名は英数字とハイフン推奨です。**スペース(半角・全角)入りの名前はビルド時にエラーになります**(リネームを求めるメッセージが表示されます)。
2. 既存の文書フォルダから `document.config.json` をコピーし、`title` と `output` を書き換えます。`output` は文書ごとに別名にしてください(一括ビルド時に重複があるとエラーになります)。
3. 原稿のMarkdownを同じフォルダに置き、`files` に列挙します。

### サブフォルダで分類する

文書が増えたら、サブフォルダで分類できます。文書名はフォルダ区切りを含めた `documents/` からの相対パスになります。

```text
documents/
├── team-a/
│   ├── report/          → .\build-pdf.ps1 team-a/report
│   └── design/          → .\build-pdf.ps1 team-a/design
└── team-b/
    └── report/          → .\build-pdf.ps1 team-b/report
```

- 一括ビルド(`-All` / `--all`)もサブフォルダの中まで探索します。
- `document.config.json` を持つフォルダが「文書」です。**文書フォルダの中に別の文書は置けません**(エラーになります)。

## 設定内のパスの規則

- `document.config.json` の中のパス(`output`、`fonts`、`styles` など)は、文書フォルダではなく**テンプレートのフォルダ基準**で書きます。そのため `fonts/` や `styles/` は全文書で共有できます。
- 原稿フォルダは既定で文書自身のフォルダです。別の場所に置く場合のみ `"sourceDir"` を指定します([../manuals/OPTIONS.md](../manuals/OPTIONS.md) 参照)。

## 文書フォルダの場所を変える

プロジェクトの規約に合わせて、`documents/` の代わりに別のフォルダ(例: `docs/specs`)を文書フォルダのルートにできます。`kit.config.json` の `"documentsDir"` で指定します([../manuals/OPTIONS.md](../manuals/OPTIONS.md) の「文書フォルダの場所を変える」参照)。
