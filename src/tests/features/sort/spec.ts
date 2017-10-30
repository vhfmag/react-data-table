import { testTableSortFeaturesWithProps } from "./assertions";
import { allOptions } from "../../../data/props";
import "jest";
import "../../setup";
import { testEnvironment } from "../../assertions";

testEnvironment();

describe("sorting features", function() {
	for (const testCase of allOptions.filter((v) => v.options.sortable)) {
		describe(`with ${testCase.description}`, function() {
			testTableSortFeaturesWithProps(testCase.props);
		});
	}
});
