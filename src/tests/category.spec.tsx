import { testTableCategoryFeaturesWithProps } from "./category.assertions";
import { testTableCoreFeaturesWithProps } from "./core.assertions";
import { generatePropsWithFeatures } from "../data/props";
import "jest";
import "./setup";

import { testEnvironment } from "./assertions";

testEnvironment();

const categorizedEmployeeProps = generatePropsWithFeatures({ categories: true });
const categorizedAndLabeledEmployeeProps = generatePropsWithFeatures({ categories: true, categoryLabel: true });

describe("the main component with categories' enabled", () => {
	testTableCoreFeaturesWithProps(categorizedEmployeeProps, "category");
	testTableCategoryFeaturesWithProps(categorizedEmployeeProps, "category");

	testTableCoreFeaturesWithProps(categorizedAndLabeledEmployeeProps, "category + category label");
	testTableCategoryFeaturesWithProps(categorizedAndLabeledEmployeeProps, "category + category label");
});
