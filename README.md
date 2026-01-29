# d-Record

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-black.png">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
  <img alt="d-Record" src="https://github.com/hamachi25/d-Record/blob/images/logo-white.png">
</picture>

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/hamachi25/d-Record?style=for-the-badge)](https://github.com/hamachi25/d-Record/releases/latest)
[![Annict](https://img.shields.io/badge/Annict-gray?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAU9JREFUeNpiYCAC/IguDiCkhpEIQxSA1H0gVuRY2vsAlzomIhyUAKXr8SkixqB8KB0AdJ0AWQYBNYJcA9MMogPIdVE8AT7hwEYKZHSANdDxuaieFHFGHK4RgLoGFj4f0NggV30gxkUBSBpBIBGJjTXQmQhEOQhsANq+AUhfwOc9JizecgBSBnC/S4tvhDInIilTgCYNvC5CjuIP7F1lC2Aug4YPVlcxYQlkZJtghjBAAxfkqgNQjJIEWHDkKxiY+LOgteH/63cQ29lYGRh+/b4ANWgiPq8hBzJI8QegIQixX78ZoOFXAMTnkcOJEa3MWY8lyufjSbQg7xqCUjoTrkAGSi6AKnRkFOBzBNFAXIgWNgKwQGfEka8mAA0qxJPq9yMnEVBKZ8IVyLj8Ao09dEvqmbAFMr4iFWrYAWi6gmcpJrTCCwQWMhAHkNUJAAQYANqUbNJwhNoXAAAAAElFTkSuQmCC)](https://annict.com/)

dアニメストア・ABEMAで視聴したアニメを[Annict](https://annict.com/)に送信して、見たアニメを記録することができるブラウザ拡張機能です。

## インストール

<a href="https://chromewebstore.google.com/detail/d-record/blcncccafadeklhhhimddgbgojalmpgn"><img alt="Chrome WebStore" src="https://github.com/user-attachments/assets/2f068f6a-98d3-48f6-8b70-e9da682c6b25" height="60"></a> <a href="https://addons.mozilla.org/ja/firefox/addon/d-record/"><img alt="Firefox Add-ons" src="https://github.com/user-attachments/assets/f9b238c8-571c-4531-8e3f-c31f203e60ef" height="60"></a>

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
pnpm build:firefox
```

## クレジット

-   [Shimba, Koji](https://github.com/shimbaco) - GraphQL APIを理解する上での手助け
-   [TomoTom0](https://github.com/TomoTom0) - dアニ上での作品タイトルの取得方法や検索精度向上のためのコード（[danime-save-annict-2](https://github.com/TomoTom0/danime-save-annict-2)）
-   [プリン](https://github.com/kazu3jp) - トークンの保存、視聴ステータスのUIに関するコード（[danict](https://github.com/kazu3jp/danict)）
-   [家守カホウ](https://twitter.com/y_kahou) - URLからページごとに実行するためのコード（[dアニメストア便利化](https://greasyfork.org/ja/scripts/414008)）
-   [REMIX ICON](https://remixicon.com/) - アイコン
