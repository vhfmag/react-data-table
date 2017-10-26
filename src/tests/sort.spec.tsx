import { testTableCoreFeaturesWithProps } from "./core.assertions";
import { testTableSortFeaturesWithProps } from "./sort.assertions";
import { generatePropsWithFeatures } from "../data/props";
import "jest";
import "./setup.ts";
import { testEnvironment } from "./assertions";

testEnvironment();

const sortableProps = generatePropsWithFeatures({ sortable: true });
const sortableWithDefaultProps = generatePropsWithFeatures({ sortable: true, defaultSort: true });

describe("the main component with sorting enabled", () => {
	testTableCoreFeaturesWithProps(sortableProps, "sortable");
	testTableSortFeaturesWithProps(sortableProps, "sortable");
	testTableCoreFeaturesWithProps(sortableWithDefaultProps, "sortable + default sort");
	testTableSortFeaturesWithProps(sortableWithDefaultProps, "sortable + default sort");
});
