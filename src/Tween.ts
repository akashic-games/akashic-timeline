import TweenOption = require("./TweenOption");
import Easing = require("./Easing");
import EasingType = require("./EasingType");
import TweenStateSerialization = require("./TweenStateSerialization");
import ActionType = require("./ActionType");

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
class Tween {
	/**
	 * アクションの実行が一時停止状態かどうかを表すフラグ。
	 * 一時停止する場合は`true`をセットする。
	 */
	paused: boolean;

	_target: any;
	_stepIndex: number;
	_loop: boolean;
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
	 * Tweenを生成する。
	 * @param target 対象となるオブジェクト
	 * @param option オプション
	 */
	constructor(target: any, option?: TweenOption) {
		this._target = target;
		this._stepIndex = 0;
		this._loop = !!option && !!option.loop;
		this._modifiedHandler = option && option.modified ? option.modified : undefined;
		this._destroyedHandler = option && option.destroyed ? option.destroyed : undefined;
		this._steps = [];
		this._lastStep = undefined;
		this._pararel = false;

		this.paused = false;
	}

	/**
	 * オブジェクトの状態を変化させるアクションを追加する。
	 * @param props 変化内容
	 * @param duration 変化に要する時間（ミリ秒）
	 * @param easing Easing関数（指定しない場合は`Easing.linear`）
	 */
	to(props: any, duration: number, easing: EasingType = Easing.linear): this {
		var action = {
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
		var type = multiply ? ActionType.TweenByMult : ActionType.TweenBy;
		var action = {
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
		var action = {
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
		var action = {
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
		var keys = Object.keys(funcs);
		keys.sort((a: string, b: string) => {
			return Number(a) > Number(b) ? 1 : -1;
		});
		var q: {time: number; func: () => void}[] = [];
		for (var i = 0; i < keys.length; ++i) {
			q.push({time: Number(keys[i]), func: funcs[keys[i]]});
		}
		var action = {
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
		var action = {
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
	 * Tweenが破棄されたかどうかを返す。
	 * `_target`が破棄された場合又は、全アクションの実行が終了した場合に`true`を返す。
	 */
	destroyed(): boolean {
		var ret = false;
		if (this._destroyedHandler) {
			ret = this._destroyedHandler.call(this._target);
		}
		if (!ret) {
			ret = this._stepIndex >= this._steps.length && !this._loop;
		}
		return ret;
	}

	/**
	 * アニメーションを実行する。
	 * @param delta 前フレームからの経過時間
	 */
	_fire(delta: number): void {
		if (this._steps.length === 0 || this.destroyed() || this.paused) {
			return;
		}
		if (this._stepIndex >= this._steps.length) {
			if (this._loop) {
				this._stepIndex = 0;
			} else {
				return;
			}
		}
		var actions = this._steps[this._stepIndex];
		var remained = false;
		for (var i = 0; i < actions.length; ++i) {
			var action = actions[i];
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
				var progress = action.easing(action.elapsed, 0, 1, action.duration);
				if (progress > 1) {
					progress = 1;
				}
				action.func.call(this._target, action.elapsed, progress);
				break;
			case ActionType.TweenTo:
			case ActionType.TweenBy:
			case ActionType.TweenByMult:
				var keys = Object.keys(action.goal);
				for (var j = 0; j < keys.length; ++j) {
					var key = keys[j];
					if (action.elapsed >= action.duration) {
						this._target[key] = action.goal[key];
					} else {
						this._target[key] = action.easing(action.elapsed, action.start[key], action.goal[key] - action.start[key], action.duration);
					}
				}
				break;
			case ActionType.Cue:
				var cueAction = action.cue[action.cueIndex];
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
			for (var k = 0; k < actions.length; ++k) {
				actions[k].initialized = false;
			}
			++this._stepIndex;
		}
	}

	/**
	 * Tweenの実行状態をシリアライズして返す。
	 */
	serializeState(): TweenStateSerialization {
		var tData: TweenStateSerialization = {
			_stepIndex: this._stepIndex,
			_steps: []
		};
		for (var i = 0; i < this._steps.length; ++i) {
			tData._steps[i] = [];
			for (var j = 0; j < this._steps[i].length; ++j) {
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
		for (var i = 0; i < serializedState._steps.length; ++i) {
			for (var j = 0; j < serializedState._steps[i].length; ++j) {
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
			var index = this._steps.push([action]) - 1;
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
		var keys = Object.keys(action.input);
		for (var i = 0; i < keys.length; ++i) {
			var key = keys[i];
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

export = Tween;
