// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
(<any>global).g = require("@akashic/akashic-engine");

import Timeline = require("../../lib/Timeline");
import { Game } from "./helpers/mock";

describe("test Timeline", () => {
	let scene: g.Scene = null;
	beforeEach(() => {
		const game = new Game({width: 320, height: 270, fps: 30, main: "", assets: {}}, null);
		scene = new g.Scene({ game: game });
	});

	afterEach(() => {
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
		const tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
	});

	it("remove", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		tl.remove(tw1);
		expect(tl._tweens.length).toBe(1);
		tl.remove(null);
		expect(tl._tweens.length).toBe(1);
		tl.remove(tw2);
		expect(tl._tweens.length).toBe(0);
	});

	it("clear", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		tl.clear();
		expect(tl._tweens.length).toBe(0);
	});

	it("cancelAll", () => {
		const tl = new Timeline(scene);
		const target = {x: 100, y: 200};
		const tween = tl.create(target);
		tween.to({x: 200, y: 300}, 100);
		scene.update.fire();
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
		scene.update.fire();
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
		scene.update.fire();

		tl.completeAll();
		expect(target1.x).toBe(200);
		expect(target1.y).toBe(300);
		expect(target2.x).toBe(350);
		expect(target2.y).toBe(350);
	});

	it("destroy", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		expect(scene.update.contains(tl._handler, tl)).toBe(true);
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweens.length).toBe(0);
		expect(scene.update.contains(tl._handler, tl)).toBe(false);
	});

	it("destroy - scene already destroyed", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		scene.destroy();
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweens.length).toBe(0);
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
		scene.update.fire();
		expect(firedCount).toBe(1);
		expect(firedFps).toBe(1000 / scene.game.fps);
		scene.update.fire();
		expect(firedCount).toBe(2);
		tl.paused = true;
		scene.update.fire();
		expect(firedCount).toBe(2);
	});

	it("_handler - auto remove", () => {
		const tl = new Timeline(scene);
		const tw1 = tl.create({x: 100, y: 200});
		let tw1d = false;
		tw1.isFinished = () => {
			return tw1d;
		};
		expect(tl._tweens.length).toBe(1);
		const tw2 = tl.create({x: 300, y: 400});
		let tw2d = false;
		tw2.isFinished = () => {
			return tw2d;
		};
		expect(tl._tweens.length).toBe(2);
		scene.update.fire();
		expect(tl._tweens.length).toBe(2);
		tw1d = true;
		scene.update.fire();
		expect(tl._tweens.length).toBe(1);
		tw2d = true;
		scene.update.fire();
		expect(tl._tweens.length).toBe(0);
	});

});
