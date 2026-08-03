<section class="chapter">

# 処理結果出力

## 機能概要

処理結果出力機能は、在庫引当結果に基づき、倉庫システム向けの出荷指示 CSV と、運用担当者向けのエラー CSV を出力する機能である。

## 出力ファイル

| ファイル ID | ファイル名 | 出力条件 | 出力先 |
| --- | --- | --- | --- |
| F-SHIPMENT | `shipment_yyyyMMdd_HHmmss.csv` | 引当済み明細が 1 件以上 | `/data/outbound/shipment/` |
| F-ERROR | `order_error_yyyyMMdd_HHmmss.csv` | エラー明細が 1 件以上 | `/data/outbound/error/` |
| F-SUMMARY | `order_summary_yyyyMMdd_HHmmss.json` | 常に出力 | `/data/outbound/summary/` |

## 出荷指示 CSV レイアウト

| No | 項目名 | 型 | 桁数 | 説明 |
| --- | --- | --- | --- | --- |
| 1 | shipment_no | 文字列 | 32 | 出荷指示番号 |
| 2 | order_id | 文字列 | 32 | EC 側受注番号 |
| 3 | product_code | 文字列 | 20 | 内部商品コード |
| 4 | quantity | 数値 | 5 | 出荷数量 |
| 5 | temperature_type | 文字列 | 10 | 常温、冷蔵、冷凍 |
| 6 | delivery_zip | 文字列 | 7 | 配送先郵便番号 |
| 7 | delivery_address | 文字列 | 200 | 配送先住所 |

## エラー CSV レイアウト

| No | 項目名 | 型 | 桁数 | 説明 |
| --- | --- | --- | --- | --- |
| 1 | order_id | 文字列 | 32 | EC 側受注番号 |
| 2 | sku | 文字列 | 30 | 商品 SKU |
| 3 | error_code | 文字列 | 10 | エラーコード |
| 4 | error_message | 文字列 | 200 | エラー内容 |

## 処理仕様

1. 受注テーブルから `ALLOCATED` の明細を取得する。
2. 出荷指示番号を採番する。
3. 出荷指示 CSV を一時ファイルとして出力する。
4. 出力完了後、一時ファイルを正式ファイル名へリネームする。
5. `ALLOCATION_FAILED` または取込エラー明細を取得し、エラー CSV を出力する。
6. 出力件数、エラー件数、処理時間をサマリー JSON に出力する。

## アクセスするデータ

| データ名 | アクセス | 用途 |
| --- | --- | --- |
| 受注テーブル | 参照、更新 | 出力対象取得、出力済み更新 |
| 受注取込エラーテーブル | 参照 | エラー CSV 作成 |
| 採番テーブル | 参照、更新 | 出荷指示番号の採番 |
| バッチ実行履歴 | 更新 | 出力件数、終了状態の記録 |

</section>
