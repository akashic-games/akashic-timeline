import * as g from "@akashic/akashic-engine";

// NOTE: スクリプトアセットとして実行される環境をエミュレーションするために globalThis.g を生成する
(globalThis as any).g = g;

import { Timeline } from "../Timeline";
import { Game } from "./helpers/mock";

describe("test Timeline", () => {
	let scene: g.Scene = null!;

	beforeEach(() => {
		const game = new Game({width: 320, height: 270, fps: 30, main: "", assets: {}});
		scene = new g.Scene({ game: game });
	});

	it("constructor", () => {
		const tl = new Timeline(scene);
		expect(tl._scene).toBe(scene);
		expect(tl._tweens.length).toBe(0);
		expect(tl._fps).toEqual(scene.game.fps);
		expect(tl.paused).toBe(false);
	});

	it("create", () => {
		const tl = new Timeline(scene);
		tl.create({x: 100, y: 200});
		expect(tl._tweensCreateQue.length).toBe(1);
		expect(tl._tweens.length).toBe(0);
		tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(tl._tweens.length).toBe(0);
		tl._handler();
		expect(tl._tweensCreateQue.length).toBe(0);
		expect(tl._tweens.length).toBe(2);
	});

	it("remove", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(tl._tweens.length).toBe(0);
		tl._handler();
		tl.remove(tw1);
		expect(tw1.isFinished()).toBe(false);
		expect(tl._tweens.length).toBe(2);
		expect(tw1._stale).toBe(true);
		expect(tw1.shouldRemove()).toBe(true);

		tw1.to({x: 200, y: 300}, 100);
		tl.remove(tw1);
		expect(tw1.isFinished()).toBe(true);
		expect(tw1._stepIndex).toBe(1);
		expect(tl._tweens.length).toBe(2);
		tl._handler();
		expect(tw1.isFinished()).toBe(true);
		expect(tl._tweens.length).toBe(1);

		tl.remove(null!);
		expect(tl._tweens.length).toBe(1);

		tl.remove(tw2);
		expect(tw2.isFinished()).toBe(false);
		expect(tl._tweens.length).toBe(1);
		expect(tw2._stale).toBe(true);
		expect(tw2.shouldRemove()).toBe(true);

		tw2.to({x: 200, y: 300}, 100);
		tl.remove(tw2);
		expect(tw2.isFinished()).toBe(true);
		expect(tw2._stepIndex).toBe(1);
		expect(tl._tweens.length).toBe(1);
		tl._handler();
		expect(tw2.isFinished()).toBe(true);
		expect(tl._tweens.length).toBe(0);
	});

	it("clear", () => {
		const tl = new Timeline(scene);
		tl.create({x: 100, y: 200});
		expect(tl._tweensCreateQue.length).toBe(1);
		tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		tl.clear();
		expect(tl._tweensCreateQue.length).toBe(2);
		tl._handler();
		expect(tl._tweensCreateQue.length).toBe(0);
	});

	it("cancelAll", () => {
		const tl = new Timeline(scene);
		const target = {x: 100, y: 200};
		const tween = tl.create(target);
		tween.to({x: 200, y: 300}, 100);
		scene.onUpdate.fire();
		tl.cancelAll();
		expect(target.x).toBeGreaterThan(100);
		expect(target.x).toBeLessThanOrEqual(200);
		expect(target.y).toBeGreaterThan(200);
		expect(target.y).toBeLessThanOrEqual(300);
	});

	it("cancelAll - revert", () => {
		const tl = new Timeline(scene);
		const target = {x: 100, y: 200};
		const tween = tl.create(target);
		tween.to({x: 200, y: 300}, 100);
		scene.onUpdate.fire();
		tl.cancelAll(true);
		expect(target.x).toBe(100);
		expect(target.y).toBe(200);
	});

	it("completeAll", () => {
		const tl = new Timeline(scene);
		const target1 = {x: 100, y: 200};
		const tw1 = tl.create(target1);
		tw1.to({x: 200, y: 300}, 100);

		const target2 = {x: 250, y: 250};
		const tw2 = tl.create(target2);
		tw2.to({x: 350, y: 350}, 100);
		tw2.to({x: 500, y: 800}, 300);
		scene.onUpdate.fire();

		tl.completeAll();
		expect(target1.x).toBe(200);
		expect(target1.y).toBe(300);
		expect(target2.x).toBe(500);
		expect(target2.y).toBe(800);
	});

	it("completeAll - nested every() with new Tween", () => {
		const tl = new Timeline(scene);
		const target1 = {x: 100};
		const target2 = {x: 200};
		let createdInEvery = false;

		const tw1 = tl.create(target1);
		tw1.every((_e, p) => {
			// 最終フレームで新しい Tween を作成
			if (p >= 1 && !createdInEvery) {
				createdInEvery = true;
				const tw2 = tl.create(target2);
				tw2.to({x: 300}, 100);
			}
		}, 50);

		scene.onUpdate.fire();

		tl.completeAll();
		expect(target1.x).toBe(100);
		expect(target2.x).toBe(300);
		expect(createdInEvery).toBe(true);
	});

	it("completeAll - nested call() with new Tween in correct order", () => {
		const game = new Game({width: 320, height: 270, fps: 30, main: "", assets: {}});
		const scene = new g.Scene({ game });
		const tl = new Timeline(scene);
		const tween = tl.create({});
		const logs: string[] = [];

		tween
			.call(() => {
				const tw1 = tl.create({});
				tw1
					.fadeIn(500)
					.call(() => {
						logs.push("expected: 1");
					})
					.wait(3000)
					.call(() => {
						logs.push("expected: 2");
					})
					.fadeOut(1000)
					.call(() => {
						logs.push("expected: 4");
					});
			})
			.wait(4000)
			.call(() => {
				logs.push("expected: 3");
			});

		tl.completeAll();

		expect(logs).toEqual([
			"expected: 1",
			"expected: 2",
			"expected: 3",
			"expected: 4",
		]);
	});

	it("destroy", () => {
		const tl = new Timeline(scene);
		tl.create({x: 100, y: 200});
		expect(tl._tweensCreateQue.length).toBe(1);
		tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(scene.onUpdate.contains(tl._handler, tl)).toBe(true);
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweens.length).toBe(0);
		expect(scene.onUpdate.contains(tl._handler, tl)).toBe(false);
	});

	it("destroy - scene already destroyed", () => {
		const tl = new Timeline(scene);
		tl.create({x: 100, y: 200});
		expect(tl._tweensCreateQue.length).toBe(1);
		tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		scene.destroy();
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(tl._tweens.length).toBe(0);
		tl._handler();
		expect(tl._tweensCreateQue.length).toBe(0);
	});

	it("destroyed", () => {
		const tl = new Timeline(scene);
		expect(tl.destroyed()).toBe(false);
		tl.destroy();
		expect(tl.destroyed()).toBe(true);
	});

	it("_handler - fire", () => {
		const tl = new Timeline(scene);
		const tw = tl.create({x: 100, y: 200});
		let firedFps = 0;
		let firedCount = 0;
		tw.isFinished = () => {
			return false;
		};
		tw._fire = (fps) => {
			firedFps = fps;
			firedCount++;
		};
		scene.onUpdate.fire();
		expect(firedCount).toBe(1);
		expect(firedFps).toBe(1000 / scene.game.fps);
		scene.onUpdate.fire();
		expect(firedCount).toBe(2);
		tl.paused = true;
		scene.onUpdate.fire();
		expect(firedCount).toBe(2);
	});

	it("_handler - auto remove", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		let tw1d = false;
		tw1.isFinished = () => {
			return tw1d;
		};
		expect(tl._tweensCreateQue.length).toBe(1);
		expect(tl._tweens.length).toBe(0);
		const tw2 = tl.create({x: 300, y: 400});
		let tw2d = false;
		tw2.isFinished = () => {
			return tw2d;
		};
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(tl._tweens.length).toBe(0);
		scene.onUpdate.fire();
		expect(tl._tweensCreateQue.length).toBe(0);
		expect(tl._tweens.length).toBe(2);
		tw1d = true;
		scene.onUpdate.fire();
		expect(tl._tweens.length).toBe(1);
		tw2d = true;
		scene.onUpdate.fire();
		expect(tl._tweens.length).toBe(0);
	});

	it("_handler - auto remove empty tweens", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		tw1.to({x: 200, y: 300}, 100);
		expect(tl._tweensCreateQue.length).toBe(1);
		expect(tl._tweens.length).toBe(0);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweensCreateQue.length).toBe(2);
		expect(tl._tweens.length).toBe(0);
		scene.onUpdate.fire();
		expect(tl._tweensCreateQue.length).toBe(0);
		expect(tl._tweens.length).toBe(2);

		tl.remove(tw1);
		tl.remove(tw2);
		scene.onUpdate.fire();
		expect(tl._tweens.length).toBe(0);
		scene.onUpdate.fire();
	});

	it("_handler - Timeline#create in _handler", () => {
		let isSucceeded = false;
		const tl = new Timeline(scene);
		function addAction(): void {
			const tw2 = tl.create({x: 100, y: 200});
			tw2.to({x: 200, y: 300}, 0);
			tw2.call(() => {
				isSucceeded = true;
			});
		}
		const tw1 = tl.create({x: 100, y: 200});
		tw1.to({x: 200, y: 300}, 0);
		tw1.call(() => {
			addAction();
		});

		expect(tl._tweensCreateQue.length).toBe(1);
		expect(tl._tweens.length).toBe(0);
		tl._handler(); // consume tw1.to
		expect(tl._tweensCreateQue.length).toBe(0);
		expect(tl._tweens.length).toBe(1);
		tl._handler(); // consume tw1.call
		tl._handler(); // consume tw2.to
		tl._handler(); // consume tw2.call
		expect(isSucceeded).toBe(true);
	});
});
