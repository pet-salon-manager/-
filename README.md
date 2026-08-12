# PawPal v20.1 — 静岡県実店舗取り込み

## 追加
- OpenStreetMap / Overpass から静岡県の店舗候補を取得
- 対象: 動物病院 / ペットショップ / トリミング / ペットホテル系
- 候補をチェックして選択
- 選択店舗を Supabase `pawpal_stores` に upsert
- 既存の店舗マスタ同期と併用

## 重要
一般利用者の読み取りはこれまで通り公開店舗のみ。
店舗取り込みの保存には authenticated 書き込み権限が必要です。
`pawpal_store_admin_write_v20_1.txt` を Supabase SQL Editor で実行してください。

本番公開前には、authenticated 全員ではなく「運営管理者だけ」に限定する管理者ロールへ絞るのが推奨です。
