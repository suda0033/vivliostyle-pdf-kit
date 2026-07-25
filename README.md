# Vivliostyle Template

Markdown原稿を[Vivliostyle](https://vivliostyle.org/)でPDF化するためのテンプレートと検証環境です。

## 他プロジェクトで使うには

**`docs/` フォルダをコピーするだけです。** `docs/` は自己完結したポータブルな文書作成環境で、使い方は [docs/README.md](docs/README.md) に書いてあります。

```
docs/
├── README.md            # 利用手順
├── setup-docs.ps1       # 初回セットアップ(PowerShell)
├── build-pdf.ps1        # PDF生成(PowerShell)
├── document.config.json # 文書タイトル、出力先、結合順
├── manuscript/          # Markdown原稿
├── assets/              # 画像
├── styles/document.css  # PDFの見た目
└── scripts/             # ビルドスクリプト
```

前提: Windows + PowerShell + Node.js 22.12以降(最新LTS推奨)。

## それ以外のフォルダ

`docs/` 以外はこのリポジトリでの検証・サンプル用です。コピーする必要はありません。

| フォルダ | 内容 |
| --- | --- |
| `samples/` | 検証用サンプル原稿(単一文書、機能仕様書) |
| `slides/` | Vivliostyleで作るスライドのサンプル |
| `styles/` | サンプル用CSS |
| `scripts/` | サンプル(機能仕様書)のビルドスクリプト |
| `dist/` | 生成済みサンプルPDF |
| `guides/` | Vivliostyle利用メモ |
| `plan/` | 検証計画 |

ルートでのサンプルビルドは `npm install` 後、`npm run build`(単一文書)、`npm run spec`(機能仕様書)、`npm run slides:build`(スライド)を実行します。
