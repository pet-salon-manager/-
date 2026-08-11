# PawPal v14

## v14で追加
- 本物の生成AIチャット
- ローカル分析 / 生成AIモード切替
- Supabase Edge Function経由
- ログイン済みユーザーのみAI利用
- OpenAI APIキーをブラウザ/GitHubに置かない構成
- 健康・体重・食事・生活・予定・緊急情報をAIへコンパクトに送信
- AI回答の医療注意表示

## 追加ファイル
- AI_SETUP.md
- supabase/functions/pawpal-ai/index.ts
- supabase/config.toml

## 重要
OPENAI_API_KEY と OPENAI_MODEL はSupabase Edge FunctionのSecretに保存します。
