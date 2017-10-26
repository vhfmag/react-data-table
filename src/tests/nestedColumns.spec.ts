import { testTableSortFeaturesWithProps } from "./sort.assertions";
import { testTableNestedColumnsFeaturesWithProps } from "./nestedColumns.assertions";
import { testTableCoreFeaturesWithProps } from "./core.assertions";
import { generatePropsWithFeatures } from "../data/props";
import "jest";
import "./setup";
import { testEnvironment } from "./assertions";

const nestedColumnsProps = generatePropsWithFeatures({ nestedColumns: true });
const nestedColumnsSortedProps = generatePropsWithFeatures({ nestedColumns: true, sortable: true });

testEnvironment();

describe("the main component with nested columns props", function() {
	describe("with regular nested columns props", function() {
		testTableCoreFeaturesWithProps(nestedColumnsProps, "regular nested columns props");
		testTableNestedColumnsFeaturesWithProps(nestedColumnsProps, "regular nested columns props");
	});

	describe("with sortable nested columns props", function() {
		testTableCoreFeaturesWithProps(nestedColumnsSortedProps, "sortable nested columns props");
		testTableSortFeaturesWithProps(nestedColumnsSortedProps, "sortable nested columns props");
		testTableNestedColumnsFeaturesWithProps(nestedColumnsSortedProps, "sortable nested columns props");
	});
});
