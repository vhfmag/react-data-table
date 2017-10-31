import { testTableRowSelectionWithProps } from "./assertions";
import { allOptions } from "../../../data/props";
import "jest";
import "../../setup";
import { testEnvironment } from "../../assertions";

testEnvironment();

describe("row selection feature", function() {
	for (const testCase of allOptions) {
		describe(`with ${testCase.description}`, function() {
			testTableRowSelectionWithProps(testCase.props);
		});
	}
});
