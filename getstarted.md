# Timelineモジュールの利用方法

## <a name="これは"></a> これは

トゥイーンアニメーションを実現するためのakashic-timeline 0.4.2とその利用方法を記述したドキュメントです。

## <a name="準備"></a> 準備

Akashicを使ったゲーム開発の準備が終わっていない場合は、[Akashicを利用したゲーム開発](https://akashic-games.github.io/tutorial/tutorial.html)を参照してゲーム開発の環境を整えて下さい。

akashic-timelineはAkashicの拡張機能として提供されています。

インストールには、akashicコマンドを使用します。
game.json が置かれているディレクトリで以下のコマンドを実行してください。

```sh
akashic install @akashic-extension/akashic-timeline
```

このコマンドは `npm install --save @akashic-extension/akashic-timeline` を行い、その後 game.json の globalScripts フィールドを更新します。(game.json の詳細は [game.jsonの仕様](https://akashic-games.github.io/guide/game-json.html) を参照してください)

akashic-timelineを利用したいシーンで以下の様に `require` を行います。

```javascript
var tl = require("@akashic-extension/akashic-timeline");
```

本ドキュメントのサンプルコードでは、akashic-timelineの機能は `tl` 変数を経由して呼び出すことになります。

次に、`scene.loaded.handle` 内で `Timeline` を生成します。
`Timeline` は後述の `Tween` を管理するオブジェクトです。

```javascript
scene.loaded.handle(function() {
    var timeline = new tl.Timeline(scene);
    ...
}
```

これでakashic-timelineを利用する準備が整いました。

## <a name="移動"></a> 移動

最初に四角形を指定した位置まで移動させてみましょう。

まず、 `FilledRect` で赤い四角形を生成してシーンに追加します。

```javascript
var rect = new g.FilledRect({scene: scene, cssColor: "red", width: 32, height: 32});
scene.append(rect);
rect.x = 10;
rect.y = 10;
rect.modified();
```

シーンに追加した四角形をX座標100の位置に1秒掛けて移動させてみましょう。

```javascript
var tween = timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed });
tween.moveX(100, 1000);
```

`timeline.create()` を呼び出すことで `rect` をアニメーション対象とした `Tween` を生成することが出来ます。
第二引数ではオプションを指定していますが、このオプションについては後述します。
`Tween` とはアニメーションの実行単位であるアクションを操作するオブジェクトです。
ゲーム開発者は、`Tween` を通して実行したいアクションを追加していきます。
アクションの詳細はakashic-timelineのAPIリファレンスを参照して下さい。

この例では `moveX` アクションを利用しています。

続けて `moveY` アクションでY座標100の位置に2秒掛けて移動させてみます。

```javascript
var tween = timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed });
tween.moveX(100, 1000);
tween.moveY(100, 2000);
```

この様に、アクションは変化内容と変化時間を指定することになります。

ここまでのコードは以下のように `.` で繋げることで簡潔に記述することが出来ます。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveX(100, 1000)
        .moveY(100, 2000);
```

X座標とY座標を同時に変化させたい場合は `moveTo` アクションを利用します。

以下の例では、2秒掛けてX座標300、Y座標400の位置に移動させています。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveTo(300, 400, 2000);
```

これまでの例では絶対位置への移動でしたが、現在の位置からの相対位置に移動させてみましょう。

`moveBy` アクションを利用することで相対位置への移動を行うことが出来ます。

以下の例では、2秒掛けて四角形をX座標150、Y座標250の位置に移動させています。

```javascript
rect.x = 100;
rect.y = 200;
rect.modified();
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveBy(50, 50, 2000);
```

## <a name="Easingの指定"></a> Easingの指定

Easingとはアニメーションの加速や減速方法を定義した関数です。

akashic-timelineでは各アクションに様々なEasingを指定することが出来ます。

Easingを指定しない以下の例では、四角形は直線的な動作で移動します。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveTo(300, 400, 2000);
```

この時、内部的には直線的な動作を行う `Easing.linear` が指定されています。
`moveTo` の第4引数に他のEasingを指定することで複雑なアニメーションをさせることが出来ます。

以下の例では、 `Easing.easeInOutCirc` を指定しています。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveTo(300, 400, 2000, tl.Easing.easeInOutCirc);
```

akashic-timelineでは標準で20種類のEasingをサポートしています。
詳しくはakashic-timelineのAPIリファレンスを参照して下さい。

## <a name="回転"></a> 回転

`rotateTo` アクションと `rotateBy` アクションを使うことで簡単に回転アニメーションを実現することが出来ます。

以下の例では、四角形を90度回転させています。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .rotateTo(90, 2000);
```

## <a name="ループ"></a> ループ

ループは `timeline.create()` のloopオプションで指定することが出来ます。

以下の例では、180度回転、-180度回転を繰り返しています。

```javascript
timeline.create(rect, {loop: true, modified: rect.modified, destroyed: rect.destroyed })
        .rotateBy(180, 1000)
        .rotateBy(-180, 1000);
```

## <a name="modifiedとinvalidate"></a> modifiedとinvalidate

これまでの例では、`timeline.create()` のmodifiedオプションで `rect.modified` を指定していました。
このmodifiedオプションは、毎フレーム、アクションを実行した度に呼び出される関数を指定するものです。

通常はAkashicのエンティティのmodifiedメソッドを指定することになります。
`Tile` や `Label` のような内部描画キャッシュを持つエンティティの場合は、必要に応じてinvalidateメソッドを指定して下さい。

なお、modifiedオプションで指定した関数内での `this` は、アニメーション対象（本ドキュメントの例では `rect` ）となります。

## <a name="並列実行"></a> 並列実行

アクションを並列実行するには `con` アクションを利用します。
`con()` を呼び出した直前のアクションと直後のアクションを並列に実行することができます。

以下の例では、`moveTo` アクションで移動しながら、 `rotateTo` アクションで回転しています。
最後に `moveTo` アクションで開始位置に戻っていますが、これは `rotateTo` アクションが完全に終了した後に実行されます。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
        .moveTo(200, 200, 1000)
        .con()
        .rotateTo(180, 2000)
        .moveTo(10, 10);
```

## <a name="その他のプロパティ制御"></a> その他のプロパティ制御

これまでの例では、 `moveTo` や `rotateTo` を使ってアニメーションを行っていました。
これらは内部的にアニメーション対象のx、y、angle等のプロパティを変化させています。

他のプロパティを制御したい場合は `to` アクションを使用することができます。

以下の例では、 `FilledRect` の `width` と `height` を変化させています。

```javascript
timeline.create(rect, {loop: true, modified: rect.modified, destroyed: rect.destroyed })
        .to({width: 500, height: 200}, 1000)
        .to({width: 0, height: 0}, 1000);
```

アクション開始位置からの相対値を指定したい場合は `by` アクションを使用することができます。

`to` アクションや `by` アクションを使うと数値型のプロパティを変化させることはできますが、 `FilledRect` の `cssColor` プロパティなど、数値型以外のプロパティを変化させることは出来ません。

そこで、 `every` アクションを使用することでより自由にプロパティを変化させることができます。

`every` アクションは毎フレーム指定された関数を呼び出すアクションです。

以下の例では、 `every` アクションに指定した関数の中で第二引数に変化量（0〜1）が渡されてくるので、
その値を元に`cssColor`を変化させています。
変化量は指定したEasingによって変化します。

```javascript
timeline.create(rect, {modified: rect.modified, destroyed: rect.destroyed })
    .every(function(elapsed, progress) {
        var c = parseInt(255 * progress);
        this.cssColor = "rgb(" + c + ",0," + c + ")";
    }, 5000, tl.Easing.easeInOutCirc);
```

この時、 `timeline.create()` のオプションで エンティティの`modified` を指定しておけば、`rect.modified()` を関数内で明示的に呼び出す必要はありません。

また、 `every` アクションで指定した関数内での `this` は、アニメーション対象（本ドキュメントの例では `rect`）となります。

`modified` と `this` に関して、 `every` と同様に指定した関数を呼び出す `call` アクションや `cue` アクションでも同じです。

## <a name="Tweenの破棄タイミング"></a> Tweenの破棄タイミング

`Tween` の破棄タイミングについて説明します。

`timeline.create()` で作成した `Tween` は `timeline.remove()` で破棄することができます。

破棄された `Tween` で定義したアクションは全て実行されなくなります。

また、以下の場合に `Tween` は自動的に破棄されます。

* 全アクションが終了し、ループしない場合
* アニメーション対象が破棄された場合

アニメーション対象が破棄されたかどうかは、 `timeline.create()` のdestroyedオプションで指定した関数を使ってチェックしています。

これまでの例では、`timeline.create()` のdestroyedオプションで `rect.destroyed` を指定していました。

通常はAkashicのエンティティのdestroyedメソッドを指定することになります。

なお、destroyedオプションで指定した関数内での `this` は、アニメーション対象（本ドキュメントの例では `rect` ）となります。
