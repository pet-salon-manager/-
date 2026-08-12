# PawPal v20.9 — 電話・ホームページ補完強化

## 強化点
店舗編集の「補完候補を探す」で、電話番号・公式ホームページ候補をより拾いやすくしました。

照合元:
- OpenStreetMap
- Overpass
- Nominatim
- Wikidata

## Wikidata連携
OpenStreetMap / Nominatim に Wikidata ID が付いている店舗は、
Wikidataの以下の情報も確認します。

- P856: 公式ウェブサイト
- P1329: 電話番号

## 出典表示
各候補に「出典」を表示します。

例:
- 出典：OpenStreetMap / Overpass
- 出典：Wikidata（公式サイト）
- 出典：Nominatim / OpenStreetMap

## 安全設計
候補は自動保存されません。

1. 補完候補を探す
2. 候補と出典を確認
3. 反映する項目だけチェック
4. フォームへ反映
5. 内容を確認
6. Supabaseへ保存

一般公開前に管理者が確認する流れを維持しています。
