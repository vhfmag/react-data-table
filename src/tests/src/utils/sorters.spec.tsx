import "jest";
import "../../setup";
import { expect } from "chai";
import { defaultNoneSorter } from "../../../utils/sorters";

describe("default none sorter", function() {
	it("should throw when used with no none value", function() {
		expect(() => defaultNoneSorter(1, 1)).to.throw();
	});
});
