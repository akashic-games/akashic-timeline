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
	_tweensCreateQue: Tween[];
	_fps: number;

	/**
	 * Timelineを生成する。
	 * @param scene タイムラインを実行する `Scene`
	 */
	constructor(scene: g.Scene) {
		this._scene = scene;
		this._tweens = [];
		this._tweensCreateQue = [];
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
		this._tweensCreateQue.push(t);
		return t;
	}

	/**
	 * Timelineに紐付いたTweenを削除する。
	 * @param tween 削除するTween。
	 */
	remove(tween: Tween): void {
		const index = this._tweens.indexOf(tween);
		const queIndex = this._tweensCreateQue.indexOf(tween);
		if (index < 0 && queIndex < 0) {
			return;
		}
		tween.cancel(false);
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
		for (let i = 0; i < this._tweensCreateQue.length; ++i) {
			const tween = this._tweensCreateQue[i];
			if (!tween.isFinished()) {
				tween.complete();
			}
		}
	}

	/**
	 * Timelineに紐付いた全Tweenのアクションを取り消す。詳細は `Tween#cancel()`の説明を参照。
	 * @param revert ターゲットのプロパティをアクション開始前に戻すかどうか (指定しない場合は `false`)
	 */
	cancelAll(revert: boolean = false): void {
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.isFinished()) {
				tween.cancel(revert);
			}
		}
		for (let i = 0; i < this._tweensCreateQue.length; ++i) {
			const tween = this._tweensCreateQue[i];
			if (!tween.isFinished()) {
				tween.cancel(revert);
			}
		}
	}

	/**
	 * Timelineに紐付いた全Tweenの紐付けを解除する。
	 */
	clear(): void {
		this.cancelAll(false);
	}

	/**
	 * このTimelineを破棄する。
	 */
	destroy(): void {
		this.clear();
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
		this._tweens = this._tweens.concat(this._tweensCreateQue);
		this._tweensCreateQue = [];

		if (this._tweens.length === 0 || this.paused) {
			return;
		}

		const tmp: Tween[] = [];
		for (let i = 0; i < this._tweens.length; ++i) {
			const tween = this._tweens[i];
			if (!tween.shouldRemove()) {
				tween._fire(1000 / this._fps);
				tmp.push(tween);
			}
		}
		this._tweens = tmp;
	}
}
