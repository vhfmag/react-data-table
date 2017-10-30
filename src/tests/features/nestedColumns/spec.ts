import { testTableNestedColumnsFeaturesWithProps } from "./assertions";
import { allOptions } from "../../../data/props";
import "jest";
import "../../setup";
import { testEnvironment } from "../../assertions";

testEnvironment();

describe("nested columns features", function() {
	for (const testCase of allOptions.filter((v) => v.options.nestedColumns)) {
		describe(`with ${testCase.description}`, function() {
			testTableNestedColumnsFeaturesWithProps(testCase.props);
		});
	}
});
