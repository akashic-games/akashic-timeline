import Tween = require("./Tween");
import TweenOption = require("./TweenOption");

/**
 * タイムライン機能を提供するクラス。
 */
class Timeline {
	/**
	 * タイムラインが一時停止状態かどうかを表すフラグ。
	 * タイムラインを一時停止する場合は`true`をセットする。
	 */
	paused: boolean;

	_scene: g.Scene;
	_tweens: Tween[];
	_fps: number;

	/**
	 * Timelineを生成する。
	 * @param scene タイムラインを実行する `Scene`
	 */
	constructor(scene: g.Scene) {
		this._scene = scene;
		this._tweens = [];
		this._fps = this._scene.game.fps;
		this.paused = false;
		scene.update.add(this._handler, this);
	}

	/**
	 * Timelineに紐付いたTweenを生成する。
	 * @param target タイムライン処理の対象にするオブジェクト
	 * @param option Tweenの生成オプション
	 */
	create(target: any, option?: TweenOption): Tween {
		var t = new Tween(target, option);
		this._tweens.push(t);
		return t;
	}

	/**
	 * Timelineに紐付いたTweenを削除する。
	 * @param tween 削除するTween。
	 */
	remove(tween: Tween): void {
		var index = this._tweens.indexOf(tween);
		if (index < 0) {
			return;
		}
		this._tweens.splice(index, 1);
	}

	/**
	 * Timelineに紐付いた全Tweenの紐付けを解除する。
	 */
	clear(): void {
		this._tweens.length = 0;
	}

	/**
	 * このTimelineを破棄する。
	 */
	destroy(): void {
		this._tweens.length = 0;
		if (!this._scene.destroyed()) {
			this._scene.update.remove(this._handler, this);
		}
		this._scene = undefined;
	}

	/**
	 * このTimelineが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this._scene === undefined;
	}

	_handler(): void {
		if (this._tweens.length === 0 || this.paused) {
			return;
		}
		var tmp: Tween[] = [];
		for (var i = 0; i < this._tweens.length; ++i) {
			var tween = this._tweens[i];
			if (!tween.destroyed()) {
				tween._fire(1000 / this._fps);
				tmp.push(tween);
			}
		}
		this._tweens = tmp;
	}
}

export = Timeline;
