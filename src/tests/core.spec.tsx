import { generatePropsWithFeatures } from "../data/props";
import "jest";

// import * as React from "react";
import { testEnvironment } from "./assertions";
import { testTableCoreFeaturesWithProps } from "./core.assertions";

import "./setup";

const emptyProps = generatePropsWithFeatures({ emptyData: true });
const employeePropsWithId = generatePropsWithFeatures({});
const employeePropsWithoutId = generatePropsWithFeatures({ disableIdAccessor: true });

testEnvironment();

describe("the main component", function() {
	describe("with empty props", function() {
		testTableCoreFeaturesWithProps(emptyProps, "empty state");
	});

	describe("with employee props without id accessor", function() {
		testTableCoreFeaturesWithProps(employeePropsWithoutId, "no id accessor");
	});

	describe("with employee props with id accessor", function() {
		testTableCoreFeaturesWithProps(employeePropsWithId, "with id accessor");
	});
});
