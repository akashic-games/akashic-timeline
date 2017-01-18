/**
 * Easing関数群。
 * 参考: http://gizma.com/easing/
 */
module Easing {

	/**
	 * 入力値をlinearした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function linear(t: number, b: number, c: number, d: number): number {
		return c * t / d + b;
	}

	/**
	 * 入力値をeaseInQuadした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInQuad(t: number, b: number, c: number, d: number): number {
		t /= d;
		return c * t * t + b;
	}

	/**
	 * 入力値をeaseOutQuadした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutQuad(t: number, b: number, c: number, d: number): number {
		t /= d;
		return -c * t * (t - 2) + b;
	}

	/**
	 * 入力値をeaseInOutQuadした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutQuad(t: number, b: number, c: number, d: number): number {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		--t;
		return -c / 2 * (t * (t - 2) - 1) + b;
	}

	/**
	 * 入力値をeaseInQubicした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInQubic(t: number, b: number, c: number, d: number): number {
		t /= d;
		return c * t * t * t + b;
	}

	/**
	 * 入力値をeaseOutQubicした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutQubic(t: number, b: number, c: number, d: number): number {
		t /= d;
		--t;
		return c * ( t * t * t + 1) + b;
	}

	/**
	 * 入力値をeaseInOutQubicした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutQubic(t: number, b: number, c: number, d: number): number {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t * t + b;
		t -= 2;
		return c / 2 * ( t * t * t + 2) + b;
	}

	/**
	 * 入力値をeaseInQuartした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInQuart(t: number, b: number, c: number, d: number): number {
		t /= d;
		return c * t * t * t * t + b;
	}

	/**
	 * 入力値をeaseOutQuartした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutQuart(t: number, b: number, c: number, d: number): number {
		t /= d;
		--t;
		return -c * (t * t * t * t - 1) + b;
	}

	/**
	 * 入力値をeaseInQuintした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInQuint(t: number, b: number, c: number, d: number): number {
		t /= d;
		return c * t * t * t * t * t + b;
	}

	/**
	 * 入力値をeaseOutQuintした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutQuint(t: number, b: number, c: number, d: number): number {
		t /= d;
		--t;
		return c * (t * t * t * t * t + 1) + b;
	}

	/**
	 * 入力値をeaseInOutQuintした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutQuint(t: number, b: number, c: number, d: number): number {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t * t * t * t + b;
		t -= 2;
		return c / 2 * (t * t * t * t * t + 2) + b;
	}

	/**
	 * 入力値をeaseInSineした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInSine(t: number, b: number, c: number, d: number): number {
		return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	}

	/**
	 * 入力値をeaseOutSineした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutSine(t: number, b: number, c: number, d: number): number {
		return c * Math.sin(t / d * (Math.PI / 2)) + b;
	}

	/**
	 * 入力値をeaseInOutSineした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutSine(t: number, b: number, c: number, d: number): number {
		return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	}

	/**
	 * 入力値をeaseInExpoした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInExpo(t: number, b: number, c: number, d: number): number {
		return c * Math.pow(2, 10 * (t / d - 1)) + b;
	}

	/**
	 * 入力値をeaseInOutExpoした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutExpo(t: number, b: number, c: number, d: number): number {
		t /= d / 2;
		if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		--t;
		return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
	}

	/**
	 * 入力値をeaseInCircした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInCirc(t: number, b: number, c: number, d: number): number {
		t /= d;
		return -c * (Math.sqrt(1 - t * t) - 1) + b;
	}

	/**
	 * 入力値をeaseOutCircした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeOutCirc(t: number, b: number, c: number, d: number): number {
		t /= d;
		--t;
		return c * Math.sqrt(1 - t * t) + b;
	}

	/**
	 * 入力値をeaseInOutCircした結果の現在位置を返す。
	 * @param t 経過時間
	 * @param b 開始位置
	 * @param c 終了位置
	 * @param d 所要時間
	 */
	export function easeInOutCirc(t: number, b: number, c: number, d: number): number {
		t /= d / 2;
		if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
		t -= 2;
		return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
	}
}

export = Easing;
