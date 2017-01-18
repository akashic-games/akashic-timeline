import ActionType = require("./ActionType");

interface TweenStateSerialization {
	_stepIndex: number;
	_steps: {
		input: any;
		start: any;
		goal: any;
		duration: number;
		elapsed: number;
		type: ActionType;
		cueIndex: number;
		initialized: boolean;
		finished: boolean;
	}[][];
}

export = TweenStateSerialization;
