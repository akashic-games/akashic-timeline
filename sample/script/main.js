const game = g.game;

// game.json の globalScripts フィールドにファイル名を列挙しておく必要がある点に注意。
const tl = require("@akashic-extension/akashic-timeline");

module.exports = function() {
  const scene = new g.Scene({ game: game });
  scene.onLoad.add(() => {
    const t = new tl.Timeline(scene);

    // シンプル往復
    const rectGray = new g.FilledRect({ scene: scene, cssColor: "gray", width: 32, height: 32 });
    scene.append(rectGray);
    rectGray.x = 10;
    rectGray.y = 10;
    rectGray.modified();
    t.create(rectGray, { loop: true })
     .to({ x: game.width - rectGray.width - 10 }, 1000, tl.Easing.linear)
     .to({ x: 10 }, 1000, tl.Easing.linear);

    // 回転しながら往復
    const rectRed = new g.FilledRect({ scene: scene, cssColor: "red", width: 32, height: 32 });
    const rectRedX = rectGray.x;
    scene.append(rectRed);
    rectRed.x = rectRedX;
    rectRed.y = rectGray.y + rectGray.height + 10;
    rectRed.modified();
    t.create(rectRed, { loop: true })
     .to({ angle: 180, x: game.width - rectRed.width - 10 }, 800, tl.Easing.linear)
     .to({ angle: 360, x: rectRedX }, 800, tl.Easing.linear)
     .to({ angle: 0 }, 0);

    // 各種イージング
    const rectBlue = new g.FilledRect({ scene: scene, cssColor: "blue", width: 32, height: 32 });
    const rectBlueX = rectRed.x;
    rectBlue.x = rectBlueX;
    rectBlue.y = rectRed.y + rectRed.height + 10;
    scene.append(rectBlue);
    const easing = Object.keys(tl.Easing);
    const tween = t.create(rectBlue, { loop: true });
    let j;
    tween.call(() => { j = 0; });
    for (var i = 0; i < easing.length; ++i) {
      tween.wait(1000)
           .call(() => { ++j; })
           .to({ opacity: 1.0 }, 200, tl.Easing.easeOutQubic)
           .to({ x: game.width - rectBlue.width - 10 }, 1000, tl.Easing[easing[i]])
           .to({ opacity: 0 }, 200, tl.Easing.easeInQubic)
           .to({ x: rectBlueX }, 200, tl.Easing.easeInOutQubic);
    }

    // カスタム関数によるアニメーション
    const rectFuchsia = new g.FilledRect({ scene: scene, cssColor: "fuchsia", width: 32, height: 32 });
    const rectFuchsiaX = rectBlue.x;
    const rectFuchsiaY = rectBlue.y + rectBlue.height + 10;
    scene.append(rectFuchsia);
    rectFuchsia.x = rectFuchsiaX;
    rectFuchsia.y = rectFuchsiaY;
    rectFuchsia.modified();
    t.create(rectFuchsia, { loop: true })
     .every((_, p) => {
       rectFuchsia.x = p * (game.width - rectGray.width - 10) + rectFuchsiaX;
       rectFuchsia.y = 15 * Math.sin(3 * p * 2 * Math.PI) + rectFuchsiaY;
     }, 1000, tl.Easing.easeInOutQubic)
     .to({ x: rectFuchsiaX }, 1000, tl.Easing.linear);

    // 並列実行によるアニメーション
    const rectGreen = new g.FilledRect({ scene: scene, cssColor: "green", width: 32, height: 32 });
    const rectGreenX = rectFuchsia.x;
    const rectGreenY = rectFuchsia.y + rectFuchsia.height + 20;
    scene.append(rectGreen);
    rectGreen.x = rectGreenX;
    rectGreen.y = rectGreenY;
    rectGreen.modified();
    t.create(rectGreen, { loop: true })
     .moveX(game.width - rectGreen.width - 10, 1000)
     .con()
     .rotateTo(180, 500)
     .moveX(rectGreenX, 1000)
     .con()
     .rotateTo(0, 1000);
  });
  g.game.pushScene(scene);
}
