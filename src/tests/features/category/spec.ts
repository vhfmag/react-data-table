import { testTableCategoryFeaturesWithProps } from "./assertions";
import { allOptions } from "../../../data/props";
import "jest";
import "../../setup";

import { testEnvironment } from "../../assertions";

testEnvironment();

describe("category features", function() {
	for (const testCase of allOptions.filter((v) => v.options.categories)) {
		describe(`with ${testCase.description}`, function() {
			testTableCategoryFeaturesWithProps(testCase.props);
		});
	}
});
