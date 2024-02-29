# d-Record
![d-record](https://github.com/chimaha/d-Record/assets/107383950/30437a94-f669-41b2-94b0-694c42a42fb3)

d-Recordは、dアニメストア上で視聴したアニメをAnnictに送信することができるブラウザ拡張機能です。  

## インストール
AMO・Chromeウェブストアにて審査中  

<br>

## 機能

### 作品ページ  

![作品画面](https://github.com/chimaha/d-Record/assets/107383950/42725696-08a5-4f43-bcb9-134baf40ea59)

- **作品ステータスを「見てる」や「見た」などのステータスに変更できる**  
- ステータス表示部分（赤いボタン）をホバーすることで、Annictから取得したアニメタイトルが表示される
- **メモアイコンをホバーして、一つずつもしくは一括で視聴したエピソードを記録できる**
- 記録すると自動的にステータスを「見てる」に変更する
- 次に見るエピソードを赤枠で囲んでいるので、どこまで見たか簡単に確認できる

<br>

### 再生ページ  

![再生画面](https://github.com/chimaha/d-Record/assets/107383950/3c35eccf-0aeb-4fd7-89f3-9d5e89427657)

- **再生から5分経つと、自動的にAnnictに記録データを送信する**  
- **右下のアップロードアイコンをオフにすることで、送信を停止できる**  
オフにした場合その作品は、再度オンにするまで送信されない  
- 再生開始から5秒間、右下にAnnictから取得したアニメタイトルが表示される（取得したアニメが正しいか確認できる）
<br>

ボタンの種類  
![ボタンの種類](https://github.com/chimaha/d-Record/assets/107383950/f05ab4ef-0e6f-46b8-bffa-5f8e12c31785)

<br>
<br>

80%程度は正しいアニメをAnncitから取得できていますが、一部間違ったアニメや間違ったクールのものを表示している場合があります。    
また作品ページでは取得できているが、再生ページでは間違ったものを取得しているということもあります。  
作品によっては対応できる可能性があるので、もしよろしければ報告してください。

<br>

## ビルド  
```
pnpm i --frozen-lockfile
pnpm install -D @types/chrome
pnpm run build
```
FirefoxとChromeのmanifest.jsonが異なるので、pubicのmanifestを環境に合わせて置き換えてください。  
切り分けてビルドするやり方がわかったら変えます。すみません...

<br>

## クレジット  
- [Shimba, Koji](https://github.com/shimbaco) - 視聴ステータスのSVGファイル、GraphQL APIを理解する上での手助け（ありがとうございます）
- [TomoTom0](https://github.com/TomoTom0) - dアニ上での作品タイトルの取得方法や検索精度向上のためのコード（[danime-save-annict-2より](https://github.com/TomoTom0/danime-save-annict-2)）
- [プリン](https://github.com/kazu3jp) - トークンの保存、視聴ステータスのUIに関するコード（[danictより](https://github.com/kazu3jp/danict)）
- [家守カホウ](https://twitter.com/y_kahou) - URLからページごとに実行するためのコード（[dアニメストア便利化より](https://greasyfork.org/ja/scripts/414008)）
