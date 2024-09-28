# d-Record

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-black.png">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
  <img alt="d-Record" src="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
</picture>

「d-Record」はdアニメストアで視聴したアニメを[Annict](https://annict.com/)に送信して、見たアニメを記録することができるブラウザ拡張機能です。

## インストール

<a href="https://chromewebstore.google.com/detail/d-record/blcncccafadeklhhhimddgbgojalmpgn"><img alt="Chrome WebStore" width="191.8" height="58" src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/HRs9MPufa1J1h5glNhut.png"></a>
<a href="https://addons.mozilla.org/ja/firefox/addon/d-record/"><img alt="Firefox Browser ADD-ONS" width="172" height="60" src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png"></a>

> [!IMPORTANT]
> 拡張機能を使用するには、Annictのトークン作成する必要があります。
>
> 1. Annictの[アプリケーション設定](https://annict.com/settings/apps)から個人用アクセストークンを作成します。
> 2. スコープを「読み込み + 書き込み」に変更して登録します。
> 3. 作成したトークンをブラウザ右上のd-Recordアイコンから保存します。

## 機能

### 作品ページ

![作品画面](https://github.com/hamachi25/d-Record/blob/images/work.jpg)

-   **作品ステータスを「見てる」や「見た」などに変更できる**
-   **各エピソードの＋アイコンをホバーして、視聴したエピソードを記録できる**
-   次に見るエピソードを赤枠で囲んでいるので、どこまで見たか簡単に確認できる

### 再生ページ

![再生画面](https://github.com/hamachi25/d-Record/blob/images/player.jpg)

-   **再生終了後に、自動的にAnnictに記録データを送信する**
-   **右下のアップロードアイコンをオフにすることで、送信を停止できる**
    -   オフにした場合その作品は、再度オンにするまで送信されない

&nbsp;

**ボタンの種類**  
![ボタンの種類](https://github.com/hamachi25/d-Record/blob/images/button.png)

**設定項目**  
![設定](https://github.com/hamachi25/d-Record/blob/images/settings.jpg)

## FAQ

### 間違った作品・シーズンが取得されている

これは dアニメストアと Annict の作品タイトルが異なっていることが原因です。  
作品によっては対応できますので、見つけたらご報告お願いします。 https://github.com/hamachi25/d-Record/issues/1

### 途中の話数から見ると視聴済みにならない

d-Recordは話数ごとに視聴しているか確認しているのではなく、まだ視聴していないエピソードの最初の話数を取得しています。  
**つまり 1 話を視聴せずにそれ以降の話数を見ても 、1 話以降は視聴していないという表示になります。**  
これはd-Recordでの表示上であって、Annictでは視聴したことになっています。

解決するには、作品ページで「ここまで記録」をクリックしてそれまでの話数を視聴済みに変更することで解決できます。

### １話から見てるのに途中の話数から視聴済みにならない

途中の話数に3.5話のような総集編が挟まっているためです。  
解決するには、Annictでその話数を視聴済みに変更するしかありません。

## ビルド

```
pnpm install
pnpm build
```

## クレジット

-   [Shimba, Koji](https://github.com/shimbaco) - 視聴ステータスのSVGファイル、GraphQL APIを理解する上での手助け
-   [TomoTom0](https://github.com/TomoTom0) - dアニ上での作品タイトルの取得方法や検索精度向上のためのコード（[danime-save-annict-2](https://github.com/TomoTom0/danime-save-annict-2)）
-   [プリン](https://github.com/kazu3jp) - トークンの保存、視聴ステータスのUIに関するコード（[danict](https://github.com/kazu3jp/danict)）
-   [家守カホウ](https://twitter.com/y_kahou) - URLからページごとに実行するためのコード（[dアニメストア便利化](https://greasyfork.org/ja/scripts/414008)）
-   [REMIX ICON](https://remixicon.com/) - アイコン
-   [CSS Stock](https://pote-chil.com/css-stock/ja/loading) - ローディングアイコン
