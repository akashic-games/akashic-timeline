# CHANGELOG

## 3.2.1
* easing 関数の `Every` で `elapsed > duration` となる不具合を修正

## 3.2.0
* `Tween#call()` の処理中に `timeline.create()` を実行して Tween を生成した場合、 Tween が Timeline キューに正しく追加されない不具合を修正

## 3.1.0
* Easing#easeInOutBack(), easeOutBounce() を追加

## 3.0.0
* akashic-engine@3.0.0 に追従

## 3.0.0-beta.2
* Timeline#completeAll(), Timeline#cancelAll() を追加
* Tween#complete(), Tween#cancel() を追加

## 3.0.0-beta.1
* akashic-engine@3.0.0-beta.28 に追従

## 3.0.0-beta.0
* akashic-engine@3.0.0 系に追従。あわせてバージョンを 3.0.0 に。

## 2.3.1
* Timeline#completeAll(), Timeline#cancelAll() を追加
* Tween#complete(), Tween#cancel() を追加

## 2.3.0
* Tween#destroyed() を Tween#isFinished() へ Function 名を変更

## 2.2.0
* Tweenオブジェクト生成時に `modified` と `destroyed` を省略した場合、対象オブジェクトのものを使うよう変更

## 2.1.0

* akashic-engine@2.3.0に追従
* ビルドツールを更新
* Easingのタイポを修正

## 2.0.1

* ドキュメントが生成できていなかったため修正

## 2.0.0

* akashic-engine@2.0.0 に追従。あわせてバージョンを 2.0.0 に。

## 0.4.3

* publish対象から不要なドキュメント類を削除

## 0.4.2

* 初期リリース
