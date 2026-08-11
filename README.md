# PawPal v18

## iPhone Safari向け JAN/EAN カメラ読み取り

v17で使っていた `BarcodeDetector API` への依存をやめ、
PawPal自身のJavaScriptでEAN/JANバーコードを解析する方式に変更しました。

### 対応
- EAN-13（日本の一般的なJAN 13桁）
- EAN-8（短縮JAN 8桁）
- iPhone Safariのカメラ映像から解析
- 写真から読み取り
- 登録済みなら商品を表示
- 未登録なら商品登録フォームへJANを自動入力
- JAN手入力も継続

### 利用のコツ
- バーコードを画面に対して水平にする
- バーコード全体を白枠に入れる
- 10〜20cmほど離す
- 反射を避ける
- 読めない場合は「写真から読み取る」を使用

GitHub PagesなどHTTPS環境で利用してください。
