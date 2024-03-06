# d-Record
![d-Record](https://github.com/chimaha/d-Record/assets/107383950/f8ad150b-23f6-42da-8f00-c9d3b850df15)


「d-Record」はdアニメストアで視聴したアニメを[Annict](https://annict.com/)に送信して、見たアニメを記録することができるブラウザ拡張機能です。  

## インストール
<a href="https://chromewebstore.google.com/detail/d-record/blcncccafadeklhhhimddgbgojalmpgn"><img alt="Chrome WebStore" width="191.8" height="58" src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/HRs9MPufa1J1h5glNhut.png"></a>
<a href="https://addons.mozilla.org/ja/firefox/addon/d-record/"><img alt="Firefox Browser ADD-ONS" width="172" height="60" src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png"></a>

> [!IMPORTANT]
> 拡張機能を使用するには、Annictのトークン作成する必要があります。
> 1. Annictの[アプリケーション設定](https://annict.com/settings/apps)から個人用アクセストークンを作成します。  
> 2. スコープを「読み込み + 書き込み」に変更して登録します。  
> 3. 作成したトークンをブラウザ右上のd-Recordアイコンから保存します。


## 機能
### 作品ページ  
![作品画面](https://github.com/chimaha/d-Record/assets/107383950/42725696-08a5-4f43-bcb9-134baf40ea59)

- **作品ステータスを「見てる」や「見た」などのステータスに変更できる**  
- **各エピソードのメモアイコンをホバーして、一つずつもしくは一括で視聴したエピソードを記録できる**
- 記録すると自動的にステータスを「見てる」に変更する
- 次に見るエピソードを赤枠で囲んでいるので、どこまで見たか簡単に確認できる

### 再生ページ  
![再生画面](https://github.com/chimaha/d-Record/assets/107383950/3c35eccf-0aeb-4fd7-89f3-9d5e89427657)

- **再生から5分経つと、自動的にAnnictに記録データを送信する**
  - 設定から動画終了時に送信するよう変更することも可能
- **右下のアップロードアイコンをオフにすることで、送信を停止できる**  
  - オフにした場合その作品は、再度オンにするまで送信されない  
- 再生開始から5秒間、右下にAnnictから取得したアニメタイトルが表示される（取得したアニメが正しいか確認できる）

&nbsp;

**ボタンの種類**  
![ボタンの種類](https://github.com/chimaha/d-Record/assets/107383950/f05ab4ef-0e6f-46b8-bffa-5f8e12c31785)  

**設定項目**  
![設定](https://github.com/hamachi25/d-Record/assets/107383950/42f17ce8-102a-45bb-b206-2811c15a58a1)  


&nbsp;

> [!NOTE]
> 95%程度は正しいアニメをAnncitから取得できていますが、一部間違ったアニメや間違ったクールのものを表示している場合があります。また作品ページでは取得できているが、再生ページでは間違ったものを取得しているということもあります。  
> 作品によっては対応できる可能性があるので、もしよろしければご報告お願いします。
> https://github.com/hamachi25/d-Record/issues/1


## ビルド  
```
pnpm i --frozen-lockfile
pnpm install -D @types/chrome
pnpm run build
```
FirefoxとChromeのmanifest.jsonが異なるので、pubicのmanifestを環境に合わせて置き換えてください。  
切り分けてビルドするやり方がわかったら変えます。すみません...


## クレジット  
- [Shimba, Koji](https://github.com/shimbaco) - 視聴ステータスのSVGファイル、GraphQL APIを理解する上での手助け（ありがとうございます）
- [TomoTom0](https://github.com/TomoTom0) - dアニ上での作品タイトルの取得方法や検索精度向上のためのコード（[danime-save-annict-2より](https://github.com/TomoTom0/danime-save-annict-2)）
- [プリン](https://github.com/kazu3jp) - トークンの保存、視聴ステータスのUIに関するコード（[danictより](https://github.com/kazu3jp/danict)）
- [家守カホウ](https://twitter.com/y_kahou) - URLからページごとに実行するためのコード（[dアニメストア便利化より](https://greasyfork.org/ja/scripts/414008)）
