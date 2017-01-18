<p align="center">
<img src="img/akashic.png"/>
</p>

# akashic-timeline

**akashic-timeline**はakashic-engine向けのトゥイーンアニメーションライブラリです。

たとえばエンティティ `e` を現在位置から座標(300, 400)へ2000ミリ秒かけて動かすアニメーションを次のように記述することができます。

```javascript
timeline.create(e, {modified: e.modified, destroyed: e.destroyed })
        .moveTo(300, 400, 2000);
```

位置だけでなく回転や透明度などもアニメーション可能で、またイージングを指定することもできます。

## 利用方法

[akashic-cli](https://github.com/akashic-games/akashic-cli)をインストールした後、

```sh
akashic install @akashic-extension/akashic-timeline
```

でインストールできます。コンテンツからは、

```javascript
var timeline = require("@akashic-extension/akashic-timeline");
```

で利用してください。

使い方は [akashic-timelineの利用方法](./getstarted.md) を参照してください。
詳細なリファレンスは [APIリファレンス](https://akashic-games.github.io/reference/akashic-timeline/index.html)を参照してください。

## サンプル

`sample/` ディレクトリに、akashic-timeline を用いるサンプルコンテンツがあります。
以下のコマンドにより `akashic-sandbox` でサンプルコンテンツを実行することができます。

```sh
git clone git@github.com:akashic-games/akashic-timeline.git
cd akashic-timeline/sample
npm install
akashic-sandbox .
```

上記コマンドの実行には Git と `akashic-sandbox` が必要です。

## ビルド方法

**akashic-timeline**はTypeScriptで書かれたライブラリであるため、ビルドにはnode.jsが必要です。

`npm run build` によりgulpを使ってビルドできます。

```sh
npm install
npm run build
```

## テスト方法

1. [TSLint](https://github.com/palantir/tslint "TSLint")を使ったLint
2. [Jasmine](https://jasmine.github.io "Jasmine")を使ったテスト

がそれぞれ実行されます。

```sh
npm run test
```

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
