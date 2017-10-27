import "jest";
import "./setup";

import { testEnvironment } from "./assertions";
import { allOptions } from "../data/props";
import { testTableCoreFeaturesWithProps } from "./core.assertions";

testEnvironment();

describe("core features", function() {
	for (const testCase of allOptions) {
		describe(`with ${testCase.description}`, function() {
			testTableCoreFeaturesWithProps(testCase.props);
		});
	}
});
