# fonts/ — 文書で使うフォント置き場

PDFで使うフォントファイル(`.ttf` / `.otf` / `.woff` / `.woff2`)を置くフォルダです。
`document.config.json` の `"fonts"` で指定したものが文書に適用され、PDFに埋め込まれます。

## 同梱フォント

[Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)(`NotoSansJP.ttf`)を同梱しています。ウェイト100〜900を1ファイルに含むバリアブルフォントで、既定の `document.config.json` はこれを使う設定になっています。そのため、日本語フォントが入っていない環境(最小構成のLinuxなど)でも追加設定なしで文字化けせずにPDFを生成できます。

Noto Sans JPのライセンスはSIL Open Font License 1.1です(同梱の [OFL.txt](OFL.txt))。再配布可能なので、このフォルダごとリポジトリにコミットして構いません。

## 別のフォントに差し替える

1. フォントファイルをこのフォルダに置きます。
2. `document.config.json` の `"fonts"` を書き換えます。

```json
{
  "fonts": {
    "family": "BIZ UDGothic",
    "faces": [
      { "file": "fonts/BIZUDGothic-Regular.ttf", "weight": 400 },
      { "file": "fonts/BIZUDGothic-Bold.ttf", "weight": 700 }
    ]
  }
}
```

詳しい手順と注意点は、[manuals/OPTIONS.md](../manuals/OPTIONS.md) の「フォントを指定する」を参照してください。

注意: フォントファイルには再配布条件があります。別のフォントをコミット・配布する場合は、そのフォントのライセンスを確認してください。
