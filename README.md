# d-Record

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-black.png">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
  <img alt="d-Record" src="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
</picture>

dアニメストア・ABEMAで視聴したアニメを[Annict](https://annict.com/)に送信して、見たアニメを記録することができるブラウザ拡張機能です。

## インストール

<a href="https://chromewebstore.google.com/detail/d-record/blcncccafadeklhhhimddgbgojalmpgn"><img alt="Chrome WebStore" width="191.8" height="58" src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/HRs9MPufa1J1h5glNhut.png"></a>
<a href="https://addons.mozilla.org/ja/firefox/addon/d-record/"><img alt="Firefox Browser ADD-ONS" width="172" height="60" src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png"></a>

> [!IMPORTANT]
> 拡張機能を使用するには、Annictのトークンを設定する必要があります。
>
> ブラウザ右上のd-Recordアイコンから、「**トークンを取得**」を押して設定します。
> https://hamachi25.github.io/d-Record/install/

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

[機能一覧](https://hamachi25.github.io/d-Record/guides/feature/)

&nbsp;

**ボタンの種類**

![ボタンの種類](https://github.com/hamachi25/d-Record/blob/images/button.png)

**設定項目**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/hamachi25/d-Record/blob/gh-pages/src/assets/settings-dark.jpg">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/hamachi25/d-Record/blob/gh-pages/src/assets/settings.jpg">
  <img alt="設定" src="https://github.com/hamachi25/d-Record/blob/gh-pages/src/assets/settings.jpg">
</picture>

## Q&A

https://hamachi25.github.io/d-Record/qa/

## ビルド

[WXT](https://wxt.dev/)と[SolidJS](https://www.solidjs.com/)を使用しています。

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
