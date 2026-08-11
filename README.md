# PawPal v13

追加:
- Supabase Auth（メール/パスワード）
- 新規登録 / ログイン / ログアウト
- 家族スペース作成
- 共有コードで家族参加
- 認証ユーザー限定RLS
- 認証済みクラウドバックアップ / 復元
- セッショントークン更新

セットアップ:
1. GitHub Pagesへ通常ファイルを上書き
2. Supabase SQL Editorで supabase_setup_v13.sql を実行
3. Supabase Authentication > Providers で Email を有効化
4. PawPalの「クラウド」で Project URL と Anon Key を保存
5. 新規登録またはログイン
6. 家族スペースを作成、または共有コードで参加

注意:
- Service Role Keyは絶対にブラウザへ入れないでください。
- 書類/アルバム画像本体はまだ端末内保存です。クラウド同期はメタデータのみです。
