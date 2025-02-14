import { ActionType } from "./ActionType";
import { Easing }  from "./Easing";
import type { EasingType } from "./EasingType";
import type { TweenOption } from "./TweenOption";
import type { TweenStateSerialization } from "./TweenStateSerialization";

interface TweenAction {
	input?: any;
	start?: any;
	goal?: any;
	duration?: number;
	easing?: (t: number, b: number, c: number, d: number) => number;
	elapsed?: number;
	func?: (() => void) | ((e: number, p: number) => void);
	type: ActionType;
	cue?: {time: number; func: () => void}[];
	cueIndex?: number;
	initialized: boolean;
	finished?: boolean;
}

/**
 * オブジェクトの状態を変化させるアクションを定義するクラス。
 * 本クラスのインスタンス生成には`Timeline#create()`を利用する。
 */
export class Tween {
	/**
	 * アクションの実行が一時停止状態かどうかを表すフラグ。
	 * 一時停止する場合は`true`をセットする。
	 */
	paused: boolean;

	_target: any;
	_stepIndex: number;
	_loop: boolean;

	/**
	 * Tween の削除可否を表すフラグ。
	 * isFinished() はアクションが 0 個の場合に真を返さないが、後方互換性のためにこの挙動は変更せず、
	 * _stale を用いて削除判定を行う。
	 */
	_stale: boolean;
	_modifiedHandler: () => void;
	_destroyedHandler: () => boolean;

	/**
	 * ステップのリスト。ステップはアクションで構成されており、
	 * 1ステップ内に複数のアクションが存在する場合、それらは並列実行される。
	 */
	private _steps: TweenAction[][];
	private _lastStep: TweenAction[];
	/**
	 * 次に追加するアクションが並列実行か否か。
	 */
	private _pararel: boolean;
	/**
	 * `_target`の初期プロパティ。
	 */
	private _initialProp: any;

	/**
	 * Tweenを生成する。
	 * @param target 対象となるオブジェクト
	 * @param option オプション
	 */
	constructor(target: any, option?: TweenOption) {
		this._target = target;
		this._stepIndex = 0;
		this._loop = !!option && !!option.loop;
		this._stale = false;
		this._modifiedHandler = undefined;
		if (option && option.modified) {
			this._modifiedHandler = option.modified;
		} else if (target && target.modified) {
			this._modifiedHandler = target.modified;
		}
		this._destroyedHandler = undefined;
		if (option && option.destroyed) {
			this._destroyedHandler = option.destroyed;
		} else if (target && target.destroyed) {
			this._destroyedHandler = target.destroyed;
		}
		this._steps = [];
		this._lastStep = undefined;
		this._pararel = false;
		this._initialProp = {};

		this.paused = false;
	}

	/**
	 * オブジェクトの状態を変化させるアクションを追加する。
	 * @param props 変化内容
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	to(props: any, duration: number, easing: EasingType = Easing.linear): this {
		const action = {
			input: props,
			duration: duration,
			easing: easing,
			type: ActionType.TweenTo,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * オブジェクトの状態を変化させるアクションを追加する。
	 * 変化内容はアクション開始時を基準とした相対値で指定する。
	 * @param props 変化内容
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 * @param multiply `true`を指定すると`props`の値をアクション開始時の値に掛け合わせた値が終了値となる（指定しない場合は`false`）
	 */
	by(props: any, duration: number, easing: EasingType = Easing.linear, multiply: boolean = false): this {
		const type = multiply ? ActionType.TweenByMult : ActionType.TweenBy;
		const action = {
			input: props,
			duration: duration,
			easing: easing,
			type: type,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * 次に追加されるアクションを、このメソッド呼び出しの直前に追加されたアクションと並列に実行させる。
	 * `Tween#con()`で並列実行を指定されたアクションが全て終了後、次の並列実行を指定されていないアクションを実行する。
	 */
	con(): this {
		this._pararel = true;
		return this;
	}

	/**
	 * オブジェクトの変化を停止するアクションを追加する。
	 * @param duration 停止する時間（ミリ秒）
	 */
	wait(duration: number): this {
		const action = {
			duration: duration,
			type: ActionType.Wait,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * 関数を即座に実行するアクションを追加する。
	 * @param func 実行する関数
	 */
	call(func: () => void): this {
		const action = {
			func: func,
			type: ActionType.Call,
			duration: 0,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * 一時停止するアクションを追加する。
	 * 内部的には`Tween#call()`で`Tween#paused`に`true`をセットしている。
	 */
	pause(): this {
		return this.call(() => {
			this.paused = true;
		});
	}

	/**
	 * 待機時間をキーとして実行したい関数を複数指定する。
	 * @param actions 待機時間をキーとして実行したい関数を値としたオブジェクト
	 */
	cue(funcs: {[key: string]: () => void}): this {
		const keys = Object.keys(funcs);
		keys.sort((a: string, b: string) => {
			return Number(a) > Number(b) ? 1 : -1;
		});
		const q: {time: number; func: () => void}[] = [];
		for (let i = 0; i < keys.length; ++i) {
			q.push({time: Number(keys[i]), func: funcs[keys[i]]});
		}
		const action = {
			type: ActionType.Cue,
			duration: Number(keys[keys.length - 1]),
			cue: q,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * 指定した時間を経過するまで毎フレーム指定した関数を呼び出すアクションを追加する。
	 * @param func 毎フレーム呼び出される関数。第一引数は経過時間、第二引数はEasingした結果の変化量（0-1）となる。
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	every(func: (e: number, p: number) => void, duration: number, easing: EasingType = Easing.linear): this {
		const action = {
			func: func,
			type: ActionType.Every,
			easing: easing,
			duration: duration,
			initialized: false
		};
		this._push(action);
		return this;
	}

	/**
	 * ターゲットをフェードインさせるアクションを追加する。
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	fadeIn(duration: number, easing: EasingType = Easing.linear): this {
		return this.to({opacity: 1}, duration, easing);
	}

	/**
	 * ターゲットをフェードアウトさせるアクションを追加する。
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	fadeOut(duration: number, easing: EasingType = Easing.linear): this {
		return this.to({opacity: 0}, duration, easing);
	}

	/**
	 * ターゲットを指定した座標に移動するアクションを追加する。
	 * @param x x座標
	 * @param y y座標
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	moveTo(x: number, y: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.to({x: x, y: y}, duration, easing);
	}

	/**
	 * ターゲットを指定した相対座標に移動するアクションを追加する。相対座標の基準値はアクション開始時の座標となる。
	 * @param x x座標
	 * @param y y座標
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	moveBy(x: number, y: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.by({x: x, y: y}, duration, easing);
	}

	/**
	 * ターゲットのX座標を指定した座標に移動するアクションを追加する。
	 * @param x x座標
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	moveX(x: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.to({x: x}, duration, easing);
	}

	/**
	 * ターゲットのY座標を指定した座標に移動するアクションを追加する。
	 * @param y y座標
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	moveY(y: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.to({y: y}, duration, easing);
	}

	/**
	 * ターゲットを指定した角度に回転するアクションを追加する。
	 * @param angle 角度
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	rotateTo(angle: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.to({angle: angle}, duration, easing);
	}

	/**
	 * ターゲットをアクション開始時の角度を基準とした相対角度に回転するアクションを追加する。
	 * @param angle 角度
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	rotateBy(angle: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.by({angle: angle}, duration, easing);
	}

	/**
	 * ターゲットを指定した倍率に拡縮するアクションを追加する。
	 * @param scaleX X方向の倍率
	 * @param scaleY Y方向の倍率
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	scaleTo(scaleX: number, scaleY: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.to({scaleX: scaleX, scaleY: scaleY}, duration, easing);
	}

	/**
	 * ターゲットのアクション開始時の倍率に指定した倍率を掛け合わせた倍率に拡縮するアクションを追加する。
	 * @param scaleX X方向の倍率
	 * @param scaleY Y方向の倍率
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	scaleBy(scaleX: number, scaleY: number, duration: number, easing: EasingType = Easing.linear): this {
		return this.by({scaleX: scaleX, scaleY: scaleY}, duration, easing, true);
	}

	/**
	 * このTweenに追加されたすべてのアクションを即座に完了する。
	 * `Tween#loop`が`true`の場合、ループの終端までのアクションがすべて実行される。
	 */
	complete(): void {
		for (let i = this._stepIndex; i < this._steps.length; ++i) {
			for (let j = 0; j < this._steps[i].length; ++j) {
				const action = this._steps[i][j];
				if (!action.initialized) {
					this._initAction(action);
				}
				const keys = Object.keys(action.goal);
				for (let k = 0; k < keys.length; ++k) {
					const key = keys[k];
					this._target[key] = action.goal[key];
				}
				if (action.type === ActionType.Call && typeof action.func === "function") {
					action.func.call(this._target);
				} else if (action.type === ActionType.Cue && action.cue) {
					for (let k = 0; k < action.cue.length; ++k) {
						action.cue[k].func.call(this._target);
					}
				} else if (action.type === ActionType.Every && typeof action.func === "function") {
					action.func.call(this._target, action.duration, 1);
				}
			}
		}
		this._stepIndex = this._steps.length;
		this._loop = false;
		this._lastStep = undefined;
		this._pararel = false;
		this.paused = false;
		if (this._modifiedHandler) {
			this._modifiedHandler.call(this._target);
		}
	}

	/**
	 * このTweenに追加されたすべてのアクションを取り消す。
	 * `revert`を`true` にした場合、ターゲットのプロパティをアクション開始前に戻す。
	 * ただし`Tween#call()`や`Tween#every()`により変更されたプロパティは戻らない点に注意。
	 * @param revert ターゲットのプロパティをアクション開始前に戻すかどうか (指定しない場合は `false`)
	 */
	cancel(revert: boolean = false): void {
		if (revert) {
			const keys = Object.keys(this._initialProp);
			for (let i = 0; i < keys.length; ++i) {
				const key = keys[i];
				this._target[key] = this._initialProp[key];
			}
		}
		this._stepIndex = this._steps.length;
		this._loop = false;
		this._lastStep = undefined;
		this._pararel = false;
		this.paused = false;
		this._stale = true;
		if (this._modifiedHandler) {
			this._modifiedHandler.call(this._target);
		}
	}

	/**
	 * アニメーションが終了しているかどうかを返す。
	 * `_target`が破棄された場合又は、全アクションの実行が終了した場合に`true`を返す。
	 */
	isFinished(): boolean {
		let ret = false;
		if (this._destroyedHandler) {
			ret = this._destroyedHandler.call(this._target);
		}
		if (!ret) {
			ret = this._stepIndex !== 0 && this._stepIndex >= this._steps.length && !this._loop;
		}
		return ret;
	}

	/**
	 * アニメーションが削除可能かどうかを返す。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	shouldRemove(): boolean {
		return this._stale || this.isFinished();
	}

	/**
	 * アニメーションを実行する。
	 * @param delta 前フレームからの経過時間
	 */
	_fire(delta: number): void {
		if (this._steps.length === 0 || this.isFinished() || this.paused) {
			return;
		}
		if (this._stepIndex >= this._steps.length) {
			if (this._loop) {
				this._stepIndex = 0;
			} else {
				return;
			}
		}
		const actions = this._steps[this._stepIndex];
		let remained = false;
		for (let i = 0; i < actions.length; ++i) {
			const action = actions[i];
			if (!action.initialized) {
				this._initAction(action);
			}
			if (action.finished) {
				continue;
			}
			action.elapsed += delta;
			switch (action.type) {
				case ActionType.Call:
					action.func.call(this._target);
					break;
				case ActionType.Every:
					const elapsed = Math.min(action.elapsed, action.duration);
					let progress = action.easing(elapsed, 0, 1, action.duration);
					if (progress > 1) {
						progress = 1;
					}
					action.func.call(this._target, elapsed, progress);
					break;
				case ActionType.TweenTo:
				case ActionType.TweenBy:
				case ActionType.TweenByMult:
					const keys = Object.keys(action.goal);
					for (let j = 0; j < keys.length; ++j) {
						const key = keys[j];
						// アクションにより undefined が指定されるケースと初期値を区別するため Object.prototype.hasOwnProperty() を利用
						// (number以外が指定されるケースは存在しないが念の為)
						if (!this._initialProp.hasOwnProperty(key)) {
							this._initialProp[key] = this._target[key];
						}
						if (action.elapsed >= action.duration) {
							this._target[key] = action.goal[key];
						} else {
							this._target[key] = action.easing(
								action.elapsed,
								action.start[key],
								action.goal[key] - action.start[key],
								action.duration
							);
						}
					}
					break;
				case ActionType.Cue:
					const cueAction = action.cue[action.cueIndex];
					if (cueAction !== undefined && action.elapsed >= cueAction.time) {
						cueAction.func.call(this._target);
						++action.cueIndex;
					}
					break;
			}
			if (this._modifiedHandler) {
				this._modifiedHandler.call(this._target);
			}
			if (action.elapsed >= action.duration) {
				action.finished = true;
			} else {
				remained = true;
			}
		}
		if (!remained) {
			for (let k = 0; k < actions.length; ++k) {
				actions[k].initialized = false;
			}
			++this._stepIndex;
		}
	}

	/**
	 * Tweenの実行状態をシリアライズして返す。
	 */
	serializeState(): TweenStateSerialization {
		const tData: TweenStateSerialization = {
			_stepIndex: this._stepIndex,
			_initialProp: this._initialProp,
			_steps: []
		};
		for (let i = 0; i < this._steps.length; ++i) {
			tData._steps[i] = [];
			for (let j = 0; j < this._steps[i].length; ++j) {
				tData._steps[i][j] = {
					input: this._steps[i][j].input,
					start: this._steps[i][j].start,
					goal: this._steps[i][j].goal,
					duration: this._steps[i][j].duration,
					elapsed: this._steps[i][j].elapsed,
					type: this._steps[i][j].type,
					cueIndex: this._steps[i][j].cueIndex,
					initialized: this._steps[i][j].initialized,
					finished: this._steps[i][j].finished
				};
			}
		}
		return tData;
	}

	/**
	 * Tweenの実行状態を復元する。
	 * @param serializedstate 復元に使う情報。
	 */
	deserializeState(serializedState: TweenStateSerialization): void {
		this._stepIndex = serializedState._stepIndex;
		this._initialProp = serializedState._initialProp;
		for (let i = 0; i < serializedState._steps.length; ++i) {
			for (let j = 0; j < serializedState._steps[i].length; ++j) {
				if (!serializedState._steps[i][j] || !this._steps[i][j]) continue;
				this._steps[i][j].input = serializedState._steps[i][j].input;
				this._steps[i][j].start = serializedState._steps[i][j].start;
				this._steps[i][j].goal = serializedState._steps[i][j].goal;
				this._steps[i][j].duration = serializedState._steps[i][j].duration;
				this._steps[i][j].elapsed = serializedState._steps[i][j].elapsed;
				this._steps[i][j].type = serializedState._steps[i][j].type;
				this._steps[i][j].cueIndex = serializedState._steps[i][j].cueIndex;
				this._steps[i][j].initialized = serializedState._steps[i][j].initialized;
				this._steps[i][j].finished = serializedState._steps[i][j].finished;
			}
		}
	}

	/**
	 * `this._pararel`が`false`の場合は新規にステップを作成し、アクションを追加する。
	 * `this._pararel`が`true`の場合は最後に作成したステップにアクションを追加する。
	 */
	private _push(action: TweenAction): void {
		if (this._pararel) {
			this._lastStep.push(action);
		} else {
			const index = this._steps.push([action]) - 1;
			this._lastStep = this._steps[index];
		}
		this._pararel = false;
	}

	private _initAction(action: TweenAction): void {
		action.elapsed = 0;
		action.start = {};
		action.goal = {};
		action.cueIndex = 0;
		action.finished = false;
		action.initialized = true;
		if (action.type !== ActionType.TweenTo
			&& action.type !== ActionType.TweenBy
			&& action.type !== ActionType.TweenByMult) {
			return;
		}
		const keys = Object.keys(action.input);
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			if (this._target[key] !== undefined) {
				action.start[key] = this._target[key];
				if (action.type === ActionType.TweenTo) {
					action.goal[key] = action.input[key];
				} else if (action.type === ActionType.TweenBy) {
					action.goal[key] = action.start[key] + action.input[key];
				} else if (action.type === ActionType.TweenByMult) {
					action.goal[key] = action.start[key] * action.input[key];
				}
			}
		}
	}
}
