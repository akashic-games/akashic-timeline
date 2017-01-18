// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
(<any>global).g = require("@akashic/akashic-engine");

import Timeline = require("../../lib/Timeline");

describe("test Timeline", () => {
	var scene: g.Scene = null;
	beforeEach(() => {
		var game = new g.Game({width: 320, height: 270, fps: 30}, null);
		scene = new g.Scene(game);
	});

	afterEach(() => {
	});

	it("constructor", () => {
		var tl = new Timeline(scene);
		expect(tl._scene).toBe(scene);
		expect(tl._tweens.length).toBe(0);
		expect(tl._fps).toEqual(scene.game.fps);
		expect(tl.paused).toBe(false);
	});

	it("create", () => {
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
	});

	it("remove", () => {
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		tl.remove(tw1);
		expect(tl._tweens.length).toBe(1);
		tl.remove(null);
		expect(tl._tweens.length).toBe(1);
		tl.remove(tw2);
		expect(tl._tweens.length).toBe(0);
	});

	it("clear", () => {
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		tl.clear();
		expect(tl._tweens.length).toBe(0);
	});

	it("destroy", () => {
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		expect(scene.update.isHandled(tl, tl._handler)).toBe(true);
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweens.length).toBe(0);
		expect(scene.update.isHandled(tl, tl._handler)).toBe(false);
	});

	it("destroy - scene already destroyed", () => {
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		expect(tl._tweens.length).toBe(2);
		scene.destroy();
		tl.destroy();
		expect(tl._scene).toBeUndefined();
		expect(tl._tweens.length).toBe(0);
	});

	it("destroyed", () => {
		var tl = new Timeline(scene);
		expect(tl.destroyed()).toBe(false);
		tl.destroy();
		expect(tl.destroyed()).toBe(true);
	});

	it("_handler - fire", () => {
		var tl = new Timeline(scene);
		var tw = tl.create({x: 100, y: 200});
		var firedFps = 0;
		var firedCount = 0;
		tw.destroyed = () => {
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
		var tl = new Timeline(scene);
		var tw1 = tl.create({x: 100, y: 200});
		var tw1d = false;
		tw1.destroyed = () => {
			return tw1d;
		};
		expect(tl._tweens.length).toBe(1);
		var tw2 = tl.create({x: 300, y: 400});
		var tw2d = false;
		tw2.destroyed = () => {
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
