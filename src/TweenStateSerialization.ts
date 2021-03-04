import { ActionType } from "./ActionType";

export interface TweenStateSerialization {
	_stepIndex: number;
	_initialProp: any;
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
