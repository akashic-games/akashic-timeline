import { Tween } from "./Tween";
import type { TweenOption } from "./TweenOption";

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
		scene.onUpdate.add(this._handler, this);
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
		// Tween#complete() を単に順番に呼ぶと Tween 内の全アクションが一度に実行されるため、
		// call() の中で新しい Tween が作成されても、その Tween の処理が後回しになり時間軸通りの順番とならない。
		//
		// 適切な実行順序を保つため以下のように処理をする:
		// 1. _tweensCreateQue を _tweens に統合
		// 2. 全ての Tween の経過時間を保持する
		// 3. 経過時間が最も短い Tween (duration が最小) のステップを優先的に完了させる
		// 4. これを繰り返して時間軸に沿った順序で実行する

		// 無限ループを防ぐための最大イテレーション数
		const MAX_ITERATIONS = 100000;
		let iterations = 0;

		this._tweens = this._tweens.concat(this._tweensCreateQue);
		this._tweensCreateQue = [];

		// 各 Tween の累積経過時間を保持
		const tweenElapsed: Map<Tween, number> = new Map();
		for (const tween of this._tweens) {
			tweenElapsed.set(tween, 0);
		}

		while (iterations < MAX_ITERATIONS) {
			// 新しく作成された Tween があれば追加
			if (this._tweensCreateQue.length > 0) {
				for (const newTween of this._tweensCreateQue) {
					this._tweens.push(newTween);
					tweenElapsed.set(newTween, 0);
				}
				this._tweensCreateQue = [];
			}

			// 次に完了する Tween を見つける (経過時間 + 現在のステップの duration が最小)
			let nextTween: Tween | null = null;
			let nextTweenDuration = Infinity;
			let minCompletionTime = Infinity;

			for (const tween of this._tweens) {
				if (tween.shouldRemove()) {
					continue;
				}

				const elapsed = tweenElapsed.get(tween) ?? 0;
				const duration = tween._getCurrentStepDuration();
				const completionTime = elapsed + duration;

				if (completionTime < minCompletionTime) {
					minCompletionTime = completionTime;
					nextTween = tween;
					nextTweenDuration = duration;
				}
			}

			if (nextTween === null) {
				break;
			}

			// ステップ内の call() で新しいTweenが作成されることを考慮し Tween を一ステップづつ完了させる
			nextTween._completeCurrentStep();
			tweenElapsed.set(nextTween, (tweenElapsed.get(nextTween) ?? 0) + nextTweenDuration);

			// 完了した Tween を削除
			this._tweens = this._tweens.filter(t => !t.shouldRemove());

			iterations++;
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
			this._scene.onUpdate.remove(this._handler, this);
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
		if (this.paused || this._tweens.length + this._tweensCreateQue.length === 0) {
			return;
		}

		this._tweens = this._tweens.concat(this._tweensCreateQue);
		this._tweensCreateQue = [];

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
