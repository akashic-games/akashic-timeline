import { Tween } from "./Tween";
import { TweenOption } from "./TweenOption";

/**
 * タイムライン機能を提供するクラス。
 */
export class Timeline {
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
	 * @param option Tweenの生成オプション。省略された場合、 {modified: target.modified, destroyed: target.destroyed} が与えられた時と同様の処理を行う。
	 */
	create(target: any, option?: TweenOption): Tween {
		const t = new Tween(target, option);
		this._tweens.push(t);
		return t;
	}

	/**
	 * Timelineに紐付いたTweenを削除する。
	 * @param tween 削除するTween。
	 */
	remove(tween: Tween): void {
		const index = this._tweens.indexOf(tween);
		if (index < 0) {
			return;
		}
		this._tweens.splice(index, 1);
	}

	/**
	 * Timelineに紐付いた全Tweenのアクションを完了させる。詳細は `Tween#complete()`の説明を参照。
	 */
	completeAll(): void {
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.isFinished()) {
				tween.complete();
			}
		}
		this.clear();
	}

	/**
	 * Timelineに紐付いた全Tweenのアクションを取り消す。詳細は `Tween#cancel()`の説明を参照。
	 * @param revert ターゲットのプロパティをアクション開始前に戻すかどうか (指定しない場合は `false`)
	 */
	cancelAll(revert: boolean = false): void {
		if (!revert) {
			this.clear();
			return;
		}
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.isFinished()) {
				tween.cancel(true);
			}
		}
		this.clear();
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
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.isFinished()) {
				tween._fire(1000 / this._fps);
			}
		}

		// tween._fire() で発火した関数で _tweens が更新された場合、単一の for ループでは tmp に加えることができないため、ループを分離
		const tmp: Tween[] = [];
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.isFinished()) {
				tmp.push(tween);
			}
		}
		this._tweens = tmp;
	}
}
