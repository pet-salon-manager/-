# PawPal v20.2 — 運営管理者ログイン

## 追加
- お店画面に「PawPal運営管理者ログイン」を追加
- Supabase Auth のメールアドレス＋パスワードでログイン
- 未ログイン時は「選択店舗をSupabaseへ保存」を無効化
- ログイン済みセッションを復元
- ログアウト対応
- RLSが拒否した場合のエラー表示を改善

## セキュリティ
Supabase側の `pawpal_stores_admin_write` RLSで、指定した管理者UIDだけが書き込み可能です。
Publishable Keyはブラウザで使用できますが、Service Role Keyは絶対にアプリへ入れないでください。

## 使い方
1. Supabase接続設定を保存
2. PawPal運営管理者ログイン
3. 静岡県の店舗候補を取得
4. 保存したい候補を選択
5. 選択店舗をSupabaseへ保存
6. 店舗マスタを同期
