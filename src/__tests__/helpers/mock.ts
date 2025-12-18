import * as g from "@akashic/akashic-engine";

/* eslint-disable @typescript-eslint/no-empty-function */
// NOTE: スクリプトアセットとして実行される環境をエミュレーションするために globalThis.g を生成する
(globalThis as any).g = g;

export class Game extends g.Game {
	constructor(
		configuration: g.GameConfiguration,
		resourceFactory: g.ResourceFactory = null!,
		assetBase?: string,
		selfId?: string,
		operationPluginViewInfo?: g.OperationPluginViewInfo,
		mainFunc?: g.GameMainFunction
	) {
		const handlerSet = new GameHandlerSet();
		super({ engineModule: g, configuration, resourceFactory, handlerSet, assetBase, selfId, operationPluginViewInfo, mainFunc });
	}
	raiseEvent(_e: g.Event): void {}
	raiseTick(_events?: g.Event[]): void {}
	addEventFilter(_filter: g.EventFilter): void {}
	removeEventFilter(_filter: g.EventFilter): void {}
	shouldSaveSnapshot(): boolean {
		return false;
	}
	saveSnapshot(_snapshot: any, _timestamp?: number): void {}
	_leaveGame(): void {}
	getCurrentTime(): number {
		return 0;
	}
	isActiveInstance(): boolean {
		return false;
	}
}

export class GameHandlerSet implements g.GameHandlerSet {
	raiseTick(_events?: any[]): void {}
	raiseEvent(_event: any): void {}
	addEventFilter(_func: g.EventFilter, _handleEmpty?: boolean): void {}
	removeEventFilter(_func: g.EventFilter): void {}
	removeAllEventFilters(): void {}
	changeSceneMode(_mode: g.SceneMode): void {}
	shouldSaveSnapshot(): boolean {
		return false;
	}
	saveSnapshot(_frame: number, _snapshot: any, _randGenSer: any, _timestamp?: number): void {}
	getInstanceType(): "active" | "passive" {
		return "passive";
	}
	getCurrentTime(): number {
		return 0;
	}
}
/* eslint-enable @typescript-eslint/no-empty-function */
