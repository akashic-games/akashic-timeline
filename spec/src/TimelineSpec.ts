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
