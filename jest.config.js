module.exports = {
	collectCoverage: true,
	coverageDirectory: "coverage",
	collectCoverageFrom: [
		"./src/**/*.ts",
		"!./src/__tests__/**/*.ts"
	],
	coverageReporters: [
		"lcov"
	],
	moduleFileExtensions: [
		"ts",
		"js"
	],
	transform: {
		"^.+\\.ts$": "ts-jest"
	},
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json"
		}
	},
	testMatch: [
		"<rootDir>/src/**/*Spec.ts"
	]
};
