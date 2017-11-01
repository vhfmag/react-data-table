import { testDataTableTotalFeatureWithProps } from "./assertions";
import { allOptions } from "../../../data/props";
import "jest";
import "../../setup";
import { testEnvironment } from "../../assertions";

testEnvironment();

describe("total rows features", function() {
	for (const testCase of allOptions.filter((v) => v.options.totalized)) {
		describe(`with ${testCase.description}`, function() {
			testDataTableTotalFeatureWithProps(testCase.props);
		});
	}
});
