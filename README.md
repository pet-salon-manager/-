# PawPal v21.5.3 — おすすめ設定修正

## 修正
PawPal店舗マスタ一覧のおすすめスイッチを、
Supabaseの `pawpal_stores.is_recommended` に直接保存するように修正しました。

## 動作
- スイッチON → `is_recommended = true`
- スイッチOFF → `is_recommended = false`
- 保存中はスイッチを一時的に無効化
- 保存失敗時は元の状態へ戻す
- 管理者ログイン必須
- 削除ボタンはそのまま利用可能

## 表示
スイッチの上に
- 「おすすめ」
- 「⭐ おすすめ」
を表示します。
