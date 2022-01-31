// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
(<any>global).g = require("@akashic/akashic-engine");

export class Game extends g.Game {
	constructor(
		configuration: g.GameConfiguration,
		resourceFactory: g.ResourceFactory,
		assetBase?: string,
		selfId?: string,
		operationPluginViewInfo?: g.OperationPluginViewInfo,
		mainFunc?: g.GameMainFunction
	) {
		const handlerSet = new GameHandlerSet();
		super({ engineModule: g, configuration, resourceFactory, handlerSet, assetBase, selfId, operationPluginViewInfo, mainFunc });
	}
	raiseEvent(e: g.Event): void {}
	raiseTick(events?: g.Event[]): void {}
	addEventFilter(filter: g.EventFilter): void {}
	removeEventFilter(filter: g.EventFilter): void {}
	shouldSaveSnapshot(): boolean { return false; }
	saveSnapshot(snapshot: any, timestamp?: number): void {}
	_leaveGame(): void {}
	getCurrentTime(): number { return 0; }
	isActiveInstance(): boolean { return false; }
}

export class GameHandlerSet implements g.GameHandlerSet {
	raiseTick(events?: any[]): void {}
	raiseEvent(event: any): void {}
	addEventFilter(func: g.EventFilter, _handleEmpty?: boolean): void {}
	removeEventFilter(func: g.EventFilter): void {}
	removeAllEventFilters(): void {}
	changeSceneMode(mode: g.SceneMode): void {}
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
