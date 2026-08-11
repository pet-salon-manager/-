# PawPal ペットスーパーアプリ v12

## v12で追加
- Supabase接続設定
- クラウドバックアップ
- クラウド復元
- 家族スペース名
- 共有コード方式
- JSON端末バックアップ / 復元
- Supabase SQLセットアップファイル

## セットアップ
1. GitHub Pagesへ通常のWebファイルを上書き
2. Supabase SQL Editorで supabase_setup.sql を1回実行
3. PawPalの「クラウド」で Project URL と Anon Key を入力
4. 家族スペース名と8文字以上の共有コードを設定
5. 「クラウドへバックアップ」

## セキュリティ
v12の家族共有は動作確認向けの簡易方式です。
本格運用では次の版でSupabase Auth + 厳格なRLSへ移行するのがおすすめです。
Service Role KeyやAI API秘密鍵はブラウザに保存しないでください。
