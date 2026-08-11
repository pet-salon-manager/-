# PawPal v14 生成AIセットアップ

## 1. Supabase Edge Function
関数名: `pawpal-ai`

ソース:
`supabase/functions/pawpal-ai/index.ts`

## 2. Supabase Secrets
SupabaseのEdge FunctionsのSecretsへ以下を登録します。

- `OPENAI_API_KEY` = OpenAI APIキー
- `OPENAI_MODEL` = OpenAIプロジェクトで利用できるモデル名

APIキーはGitHubやPawPalのHTML/JavaScriptには絶対に書かないでください。

## 3. Deploy
Supabase DashboardのEdge Functionsから `pawpal-ai` を作成し、
`index.ts` の内容を貼り付けてDeployします。

## 4. PawPal
v14へ更新後、
AI → 「☁️ 生成AI」→ 質問 → 「AIに相談する」

Supabaseログイン済みのユーザーだけがEdge Functionへアクセスする構成です。
