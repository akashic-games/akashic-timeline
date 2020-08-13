// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
(<any>global).g = require("@akashic/akashic-engine");

import Tween = require("../../lib/Tween");
import Easing = require("../../lib/Easing");
import Timeline = require("../../lib/Timeline");

class Game extends g.Game {
	raiseEvent(e: g.Event): void {}
	raiseTick(events?: g.Event[]): void {}
	addEventFilter(filter: g.EventFilter): void {}
	removeEventFilter(filter: g.EventFilter): void {}
	shouldSaveSnapshot(): boolean { return false; }
	saveSnapshot(snapshot: any, timestamp?: number): void {}
	_leaveGame(): void {}
}

describe("test Tween", () => {
	beforeEach(() => {
	});

	afterEach(() => {
	});

	it("constructor", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		expect(tw._target).toBe(target);
		expect(tw._stepIndex).toBe(0);
		expect(tw._loop).toBe(false);
		expect(tw._modifiedHandler).toBeUndefined();
		expect(tw._destroyedHandler).toBeUndefined();
		expect((<any>tw)._steps.length).toBe(0);
		expect((<any>tw)._lastStep).toBeUndefined();
		expect(tw.paused).toBe(false);

		tw = new Tween(null, {loop: true});
		expect(tw._loop).toBe(true);
	});

	it("constructor - with TweenOption", () => {
		var target = {x: 100, y: 200};
		var tweenOption = {
			modified: () => {},
			destroyed: () => { return false; }
		};
		var tw = new Tween(target, tweenOption);
		expect(tw._target).toBe(target);
		expect(tw._stepIndex).toBe(0);
		expect(tw._loop).toBe(false);
		expect(tw._modifiedHandler).toBe(tweenOption.modified);
		expect(tw._destroyedHandler).toBe(tweenOption.destroyed);
		expect((<any>tw)._steps.length).toBe(0);
		expect((<any>tw)._lastStep).toBeUndefined();
		expect(tw.paused).toBe(false);
	});

	it("to", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.to({x: 200, y: 300}, 1000);
		tw._fire(100);
		expect(tw._target).toEqual({x: Easing.linear(100, 100, 100, 1000), y: Easing.linear(100, 200, 100, 1000)});
		tw._fire(400);
		expect(tw._target).toEqual({x: Easing.linear(500, 100, 100, 1000), y: Easing.linear(500, 200, 100, 1000)});
		tw._fire(500);
		expect(tw._target).toEqual({x: Easing.linear(1000, 100, 100, 1000), y: Easing.linear(1000, 200, 100, 1000)});
		tw._fire(100);
		expect(tw._target).toEqual({x: 200, y: 300});
	});

	it("to - loop", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target, {loop: true});
		tw.to({x: 200, y: 300}, 1000, Easing.easeInCirc).to({x: 0, y: 0}, 1000);
		tw._fire(1000);
		expect(tw._target).toEqual({x: 200, y: 300});
		tw._fire(1000);
		expect(tw._target).toEqual({x: 0, y: 0});
		tw._fire(1000);
		expect(tw._target).toEqual({x: 200, y: 300});
	});

	it("to - paused", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target, {loop: true});
		tw.to({x: 200, y: 300}, 1000, Easing.easeInExpo).to({x: 0, y: 0}, 1000, Easing.easeInExpo);
		tw._fire(200);
		expect(tw._target).toEqual({x: Easing.easeInExpo(200, 0, 200, 1000), y: Easing.easeInExpo(200, 0, 300, 1000)});
		tw.paused = true;
		tw._fire(200);
		expect(tw._target).toEqual({x: Easing.easeInExpo(200, 0, 200, 1000), y: Easing.easeInExpo(200, 0, 300, 1000)});
	});

	it("to - modifiedHandler", () => {
		var target = {x: 0, y: 0};
		var count = 0;
		var m = () => {
			count++;
		};
		var tw = new Tween(target, {modified: m});
		tw.to({x: 200, y: 300}, 1000, Easing.easeInOutCirc);
		tw._fire(200);
		expect(count).toBe(1);
		tw._fire(200);
		expect(count).toBe(2);
		tw._fire(200);
		expect(count).toBe(3);
		tw._fire(200);
		expect(count).toBe(4);
		tw._fire(200);
		expect(count).toBe(5);
		tw._fire(200);
		expect(count).toBe(5);
	});

	it("to - operate undefined target", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target);
		tw.to({x: 200, y: 300, angle: 100}, 1000, Easing.easeInOutExpo);
		tw._fire(500);
		expect(tw._target).toEqual({x: Easing.easeInOutExpo(500, 0, 200, 1000), y: Easing.easeInOutExpo(500, 0, 300, 1000)});
		tw._fire(500);
		expect(tw._target).toEqual({x: 200, y: 300});
	});

	it("by", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.by({x: 200, y: 300}, 100, Easing.easeInOutQuad).by({x: -300, y: -500}, 100, Easing.easeInOutQubic);
		tw._fire(100);
		expect(tw._target).toEqual({x: 300, y: 500});
		tw._fire(100);
		expect(tw._target).toEqual({x: 0, y: 0});
	});

	it("by - loop", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target, {loop: true});
		tw.by({x: 200, y: 300}, 1000).by({x: -200, y: -300}, 1000, Easing.easeInOutQuint);
		tw._fire(1000);
		expect(tw._target).toEqual({x: 200, y: 300});
		tw._fire(1000);
		expect(tw._target).toEqual({x: 0, y: 0});
		tw._fire(1000);
		expect(tw._target).toEqual({x: 200, y: 300});
	});

	it("by - paused", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target, {loop: true});
		tw.by({x: 200, y: 300}, 1000, Easing.easeInOutSine).by({x: -200, y: -300}, 1000, Easing.easeInQuad);
		tw._fire(200);
		expect(tw._target).toEqual({x: Easing.easeInOutSine(200, 0, 200, 1000), y: Easing.easeInOutSine(200, 0, 300, 1000)});
		tw.paused = true;
		tw._fire(200);
		expect(tw._target).toEqual({x: Easing.easeInOutSine(200, 0, 200, 1000), y: Easing.easeInOutSine(200, 0, 300, 1000)});
	});

	it("by - set multiple", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.by({x: 2, y: 2}, 100, Easing.easeOutSine, true).by({x: 0, y: 0}, 100, Easing.easeOutSine, true);
		tw._fire(100);
		expect(tw._target).toEqual({x: 200, y: 400});
		tw._fire(100);
		expect(tw._target).toEqual({x: 0, y: 0});
	});

	it("by - modifiedHandler", () => {
		var target = {x: 0, y: 0};
		var count = 0;
		var m = () => {
			count++;
		};
		var tw = new Tween(target, {modified: m});
		tw.by({x: 200, y: 300}, 1000, Easing.easeInQuart);
		tw._fire(200);
		expect(count).toBe(1);
		tw._fire(200);
		expect(count).toBe(2);
		tw._fire(200);
		expect(count).toBe(3);
		tw._fire(200);
		expect(count).toBe(4);
		tw._fire(200);
		expect(count).toBe(5);
		tw._fire(200);
		expect(count).toBe(5);
	});

	it("con", () => {
		var target = {x: 100, y: 200, angle: 0};
		var tw = new Tween(target);
		tw
			.by({x: 200, y: 200}, 200, Easing.easeInQubic)
			.con()
			.rotateTo(180, 200, Easing.easeInQuint);
		tw._fire(100);
		expect(tw._target).toEqual({x: Easing.easeInQubic(100, 100, 200, 200), y: Easing.easeInQubic(100, 200, 200, 200), angle: Easing.easeInQuint(100, 0, 180, 200)});
		tw._fire(100);
		expect(tw._target).toEqual({x: 300, y: 400, angle: 180});
	});

	it("wait", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw
			.to({x: 200, y: 300}, 100, Easing.easeInSine)
			.wait(1000)
			.to({x: 300, y: 400}, 100, Easing.easeOutCirc);
		tw._fire(100);
		expect(tw._target).toEqual({x: 200, y: 300});
		tw._fire(500);
		expect(tw._target).toEqual({x: 200, y: 300});
		tw._fire(500);
		tw._fire(100); // 1回の fire で1つの action しか実行されないため、fire を2回実行
		expect(tw._target).toEqual({x: 300, y: 400});
	});

	it("call", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		var count = {x: 0, y: 0};
		var call = () => {
			count.x = target.x;
			count.y = target.y;
		};
		tw.to({x: 200, y: 300}, 1000, Easing.easeOutQuad).call(call);
		tw._fire(100);
		expect(count).toEqual({x: 0, y: 0}); // まだ呼ばれない
		tw._fire(900);
		expect(count).toEqual({x: 0, y: 0}); // まだギリギリ呼ばれない
		tw._fire(100);
		expect(count).toEqual({x: 200, y: 300}); // ここで呼ばれる
	});

	it("pause", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		expect(tw.paused).toBe(false);
		tw.to({x: 200, y: 300}, 100, Easing.easeOutQuart).pause();
		expect(tw.paused).toBe(false);
		tw._fire(50);
		expect(tw.paused).toBe(false);
		tw._fire(50); // to の終了
		tw._fire(50); // pause の開始
		expect(tw.paused).toBe(true);
	});

	it("cue", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		var result: number;
		var cue: {[key: string]: () => void} = {
			"0": () => {
				result = 0;
			},
			"100": () => {
				result = 100;
			},
			"1000": () => {
				result = 1000;
			},
		};
		tw.cue(cue);
		tw._fire(1);
		expect(result).toBe(0);
		tw._fire(100);
		expect(result).toBe(100);
		tw._fire(900);
		expect(result).toBe(1000);
	});

	it("cue - random order", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		var result: number;
		var cue: {[key: string]: () => void} = {
			"1000": () => {
				result = 1000;
			},
			"0": () => {
				result = 0;
			},
			"100": () => {
				result = 100;
			}
		};
		tw.cue(cue);
		tw._fire(1);
		expect(result).toBe(0);
		tw._fire(100);
		expect(result).toBe(100);
		tw._fire(900);
		expect(result).toBe(1000);
	});

	it("every", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		var elapsed = 0;
		var progress = 0;
		tw.every((e, p) => {
			elapsed = e;
			progress = p;
		}, 1000);
		tw._fire(100);
		expect(elapsed).toBe(100);
		expect(progress).toBe(0.1);
		tw._fire(400);
		expect(elapsed).toBe(500);
		expect(progress).toBe(0.5);
		tw._fire(500);
		expect(elapsed).toBe(1000);
		expect(progress).toBe(1);
	});

	it("every - elapsed > duration", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		var elapsed = 0;
		var progress = 0;
		tw.every((e, p) => {
			elapsed = e;
			progress = p;
		}, 1000);
		tw._fire(100);
		expect(elapsed).toBe(100);
		expect(progress).toBe(0.1);
		tw._fire(400);
		expect(elapsed).toBe(500);
		expect(progress).toBe(0.5);
		tw._fire(1000);
		expect(elapsed).toBe(1500);
		expect(progress).toBe(1);
	});

	it("fadeIn", () => {
		var target = {x: 100, y: 200, opacity: 0};
		var tw = new Tween(target);
		expect(tw._target.opacity).toBe(0);
		tw.fadeIn(1000);
		tw._fire(500);
		expect(tw._target.opacity).toBe(0.5);
		tw._fire(500);
		expect(tw._target.opacity).toBe(1);
	});

	it("fadeOut", () => {
		var target = {x: 100, y: 200, opacity: 1};
		var tw = new Tween(target);
		expect(tw._target.opacity).toBe(1);
		tw.fadeOut(1000);
		tw._fire(500);
		expect(tw._target.opacity).toBe(0.5);
		tw._fire(500);
		expect(tw._target.opacity).toBe(0);
	});

	it("moveTo", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.moveTo(200, 300, 1000);
		tw._fire(100);
		expect(tw._target).toEqual({x: 110, y: 210});
		tw._fire(400);
		expect(tw._target).toEqual({x: 150, y: 250});
		tw._fire(500);
		expect(tw._target).toEqual({x: 200, y: 300});
	});

	it("moveBy", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.moveBy(200, 300, 1000);
		tw._fire(100);
		expect(tw._target).toEqual({x: 120, y: 230});
		tw._fire(400);
		expect(tw._target).toEqual({x: 200, y: 350});
		tw._fire(500);
		expect(tw._target).toEqual({x: 300, y: 500});
	});

	it("moveX", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.moveX(200, 1000);
		tw._fire(100);
		expect(tw._target).toEqual({x: 110, y: 200});
		tw._fire(400);
		expect(tw._target).toEqual({x: 150, y: 200});
		tw._fire(500);
		expect(tw._target).toEqual({x: 200, y: 200});
	});

	it("moveY", () => {
		var target = {x: 100, y: 200};
		var tw = new Tween(target);
		tw.moveY(300, 1000);
		tw._fire(100);
		expect(tw._target).toEqual({x: 100, y: 210});
		tw._fire(400);
		expect(tw._target).toEqual({x: 100, y: 250});
		tw._fire(500);
		expect(tw._target).toEqual({x: 100, y: 300});
	});

	it("rotateTo", () => {
		var target = {angle: 50};
		var tw = new Tween(target);
		expect(tw._target).toEqual({angle: 50});
		tw.rotateTo(90, 1000);
		tw._fire(500);
		expect(tw._target).toEqual({angle: 70});
		tw._fire(500);
		expect(tw._target).toEqual({angle: 90});
	});

	it("rotateBy", () => {
		var target = {angle: 50};
		var tw = new Tween(target);
		expect(tw._target).toEqual({angle: 50});
		tw.rotateBy(90, 1000);
		tw._fire(500);
		expect(tw._target).toEqual({angle: 95});
		tw._fire(500);
		expect(tw._target).toEqual({angle: 140});
	});

	it("scaleTo", () => {
		var target = {scaleX: 1, scaleY: 1};
		var tw = new Tween(target);
		expect(tw._target).toEqual({scaleX: 1, scaleY: 1});
		tw.scaleTo(2, 2, 1000);
		tw._fire(500);
		expect(tw._target).toEqual({scaleX: 1.5, scaleY: 1.5});
		tw._fire(500);
		expect(tw._target).toEqual({scaleX: 2, scaleY: 2});
	});

	it("scaleBy", () => {
		var target = {scaleX: 2, scaleY: 2};
		var tw = new Tween(target);
		expect(tw._target).toEqual({scaleX: 2, scaleY: 2});
		tw.scaleBy(2, 2, 1000);
		tw._fire(500);
		expect(tw._target).toEqual({scaleX: 3, scaleY: 3});
		tw._fire(500);
		expect(tw._target).toEqual({scaleX: 4, scaleY: 4});
	});

	it("isFinished", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target);
		// インスタンス生成直後は終了していない
		expect(tw.isFinished()).toBe(false);
		tw._loop = false;
		expect(tw.isFinished()).toBe(false);
		tw._loop = true;
		expect(tw.isFinished()).toBe(false);
		// アニメーション途中
		tw.to({ x: 200, y: 300 }, 500);
		tw._fire(300);
		expect(tw.isFinished()).toBe(false);
		// アニメーション完了 loop=true
		tw._fire(200);
		expect(tw.isFinished()).toBe(false);
		// アニメーション完了 loop=false
		tw._loop = false;
		expect(tw.isFinished()).toBe(true);
	});

	it("isFinished - destroyedHandler", () => {
		var target = {x: 0, y: 0};
		var dres = false;
		var d = () => {
			return dres;
		};
		var tw = new Tween(target, {destroyed: d});
		tw._loop = true;
		expect(tw.isFinished()).toBe(false);
		dres = true;
		expect(tw.isFinished()).toBe(true);
	});

	it("push - no pararel", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target);
		var action1 = {
			input: target,
			duration: 1000,
			easing: Easing.linear
		};
		var action2 = {
			input: target,
			duration: 100,
			easing: Easing.linear
		};
		var anyTw = <any>tw;
		anyTw._push(action1);
		anyTw._push(action2);
		expect(anyTw._lastStep[0]).toBe(action2);
		expect(anyTw._steps[0][0]).toBe(action1);
		expect(anyTw._steps[1][0]).toBe(action2);
	});

	it("push - pararel", () => {
		var target = {x: 0, y: 0};
		var tw = new Tween(target);
		var action1 = {
			input: target,
			duration: 1000,
			easing: Easing.linear
		};
		var action2 = {
			input: target,
			duration: 100,
			easing: Easing.linear
		};
		var anyTw = <any>tw;
		anyTw._push(action1);
		anyTw._pararel = true;
		anyTw._push(action2);
		expect(anyTw._lastStep[0]).toBe(action1);
		expect(anyTw._lastStep[1]).toBe(action2);
	});

	it("complete", () => {
		let calledCount = 0;
		let modified = false;
		const target = {
			x: 0,
			y: 0,
			angle: 0,
			modified: () => {
				modified = true;
			}
		};
		const tw = new Tween(target, {modified: target.modified});
		tw.to({x: 100, y: 100}, 1000);
		tw.con();
		tw.rotateTo(180, 1000)
		tw.call(() => { ++calledCount; });
		tw.to({x: 200, y: 200}, 1000);
		tw.con();
		tw.rotateTo(0, 1000)
		tw.call(() => { ++calledCount; });
		tw.cue({
			"0": () => {
				++calledCount;
			},
			"100": () => {
				++calledCount;
			},
			"1000": () => {
				++calledCount;
			},
			"10000": () => {
				++calledCount;
			}
		});

		let elapsed: number;
		let progress: number;
		tw.every(
			(e, p) => {
				++calledCount;
				elapsed = e;
				progress = p;
			},
			1000
		);

		tw._fire(500);
		tw._fire(500);
		tw._fire(500);

		modified = false; // complete() の呼び出しで modified() が呼ばれることを確認
		tw.complete();

		expect(tw._target.x).toBe(200);
		expect(tw._target.y).toBe(200);
		expect(tw._target.angle).toBe(0);
		expect(modified).toBe(true);
		expect(calledCount).toBe(7);
		expect(elapsed).toBe(1000);
		expect(progress).toBe(1);
		expect(tw.isFinished()).toBe(true);
	});

	it("complete - loop", () => {
		let modified = false;
		let calledCount = 0;
		const target = {
			x: 0,
			y: 0,
			angle: 0,
			modified: () => {
				modified = true;
			}
		};
		const tw = new Tween(target, {loop: true, modified: target.modified});
		tw.to({x: 100, y: 100}, 1000);
		tw.con();
		tw.rotateTo(180, 1000);
		tw.to({x: 200, y: 200}, 1000);
		tw.call(() => { ++calledCount; });
		tw.con();
		tw.rotateTo(0, 1000);
		tw.call(() => { ++calledCount; });

		tw._fire(1500);
		tw._fire(1500);
		tw._fire(1500);

		modified = false; // complete() の呼び出しで modified() が呼ばれることを確認
		tw.complete();

		expect(tw._target.x).toBe(200);
		expect(tw._target.y).toBe(200);
		expect(tw._target.angle).toBe(0);
		expect(modified).toBe(true);
		expect(calledCount).toBe(2);
		expect(tw.isFinished()).toBe(true);
	});

	it("cancel", () => {
		let modified = false;
		let calledCount = 0;
		const target = {
			x: 0,
			y: 0,
			angle: 0,
			modified: () => {
				modified = true;
			}
		};
		const tw = new Tween(target, {modified: target.modified});
		tw.to({x: 100, y: 100}, 1000);
		tw.con();
		tw.rotateTo(180, 1000)
		tw.call(() => { ++calledCount; });

		tw._fire(500);

		modified = false; // cancel() の呼び出しで modified() が呼ばれることを確認
		tw.cancel();

		expect(tw._target.x).toBe(50);
		expect(tw._target.y).toBe(50);
		expect(tw._target.angle).toBe(90);
		expect(modified).toBe(true);
		expect(calledCount).toBe(0);
		expect(tw.isFinished()).toBe(true);
	});

	it("reverts the target's properties to initial value", () => {
		let modified = false;
		let calledCount = 0;
		const target = {
			x: 0,
			y: 0,
			angle: 0,
			modified: () => {
				modified = true;
			}
		};
		const tw = new Tween(target, {modified: target.modified});
		tw.to({x: 100, y: 100}, 1000);
		tw.con();
		tw.rotateTo(180, 1000);
		tw.call(() => { ++calledCount; });
		tw._fire(500);

		modified = false; // cancel() の呼び出しで modified() が呼ばれることを確認
		tw.cancel(true);

		expect(tw._target.x).toBe(0);
		expect(tw._target.y).toBe(0);
		expect(tw._target.angle).toBe(0);
		expect(modified).toBe(true);
		expect(calledCount).toBe(0);
		expect(tw.isFinished()).toBe(true);

		modified = false;
		calledCount = 0;

		const twLoop = new Tween(target, {loop: true, modified: target.modified});
		twLoop.to({x: 100, y: 100}, 1000);
		twLoop.con();
		twLoop.rotateTo(180, 1000);
		twLoop.call(() => { ++calledCount; });
		twLoop._fire(500);

		modified = false; // cancel() の呼び出しで modified() が呼ばれることを確認
		twLoop.cancel(true);

		expect(tw._target.x).toBe(0);
		expect(tw._target.y).toBe(0);
		expect(tw._target.angle).toBe(0);
		expect(modified).toBe(true);
		expect(calledCount).toBe(0);
		expect(tw.isFinished()).toBe(true);
	});

	it("calls target's modified(), when the modified option is omitted", () => {
		let count = 0;
		const target = {x: 0, y: 0, modified: () => { count++; }};
		const tw = new Tween(target);
		tw.to({x: 200, y: 300}, 600, Easing.easeInOutCirc);
		tw._fire(200);
		expect(count).toBe(1);
		tw._fire(200);
		expect(count).toBe(2);
		tw._fire(200);
		expect(count).toBe(3);
		tw._fire(200);
		expect(count).toBe(3);
		const twLoop = new Tween(target, {loop: true});
		twLoop.to({x: 200, y: 300}, 200, Easing.easeInOutCirc);
		twLoop._fire(200);
		expect(count).toBe(4);
		twLoop._fire(200);
		expect(count).toBe(5);
	});

	it("calls target's destroyed(), when the destroyed option is omitted", () => {
		let count = 0;
		const target = {x: 0, y: 0, destroyed: () => { count++; return false; }};
		const tw = new Tween(target);
		tw.isFinished();
		expect(count).toBe(1);
		tw.isFinished();
		expect(count).toBe(2);
		const twLoop = new Tween(target, {loop: true});
		twLoop.isFinished();
		expect(count).toBe(3);
		twLoop.isFinished();
		expect(count).toBe(4);
	});
});

describe("test Tween serializeState", () => {
	var scene: g.Scene = null;
	var game: g.Game = null;
	beforeEach(() => {
		game = new Game({width: 320, height: 270, fps: 30}, null);
		scene = new g.Scene({ game: game });
	});

	afterEach(() => {
	});

	it("serializeState", () => {
		var tl = new Timeline(scene);
		var e = new g.E({
			scene: scene,
			id: 10,
			x: 10,
			y: 20
		});
		scene.append(e);
		var tween = tl.create(e, {modified: e.modified, destroyed: e.destroyed});
		var anyTw = <any>tween;
		tween.moveTo(100, 200, 1000);
		tween._fire(100);
		var state = tween.serializeState();
		expect(state._stepIndex).toBe(0);
		expect(state._initialProp).toEqual({x: 10, y: 20});
		expect(state._steps.length).toBe(1);
		expect(state._steps[0][0].input).toEqual(anyTw._steps[0][0].input);
		expect(state._steps[0][0].start).toEqual(anyTw._steps[0][0].start);
		expect(state._steps[0][0].goal).toEqual(anyTw._steps[0][0].goal);
		expect(state._steps[0][0].type).toEqual(anyTw._steps[0][0].type);
		expect(state._steps[0][0].duration).toEqual(anyTw._steps[0][0].duration);
		expect(state._steps[0][0].elapsed).toEqual(anyTw._steps[0][0].elapsed);
		expect(state._steps[0][0].initialized).toEqual(anyTw._steps[0][0].initialized);
		expect(state._steps[0][0].finished).toEqual(anyTw._steps[0][0].finished);
	});

	it("resume", () => {
		var tl = new Timeline(scene);
		var e = new g.E({
			scene: scene,
			id: 10
		});
		scene.append(e);
		var tween = tl.create(e, {modified: e.modified, destroyed: e.destroyed});
		tween.moveX(100, 1000).moveY(100, 1000);
		for (var i = 0; i<50; ++i) {
			scene.update.fire();
		}
		var state = tween.serializeState();

		var e2 = new g.E({
			scene: scene,
			id: 11
		});
		scene.append(e2);
		var tween2 = tl.create(e2, {modified: e2.modified, destroyed: e2.destroyed});
		tween2.moveX(100, 1000).moveY(100, 1000);
		tween2.deserializeState(state);
		expect(tween2._stepIndex).toBe(1);
		var anyTw = <any>tween2;
		expect(state._initialProp).toEqual(anyTw._initialProp);
		expect(state._steps[1][0].input).toEqual(anyTw._steps[1][0].input);
		expect(state._steps[1][0].start).toEqual(anyTw._steps[1][0].start);
		expect(state._steps[1][0].goal).toEqual(anyTw._steps[1][0].goal);
		expect(state._steps[1][0].type).toEqual(anyTw._steps[1][0].type);
		expect(state._steps[1][0].duration).toEqual(anyTw._steps[1][0].duration);
		expect(state._steps[1][0].elapsed).toEqual(anyTw._steps[1][0].elapsed);
		expect(state._steps[1][0].initialized).toEqual(anyTw._steps[1][0].initialized);
		expect(state._steps[1][0].finished).toEqual(anyTw._steps[1][0].finished);
	});
});

