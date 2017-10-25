import DataTableRow, { DataTableRuleRow } from "../row";
import "jest";
import "./setup";
import { expect } from "chai";
import * as React from "react";

import { shouldntThrowWithProps, testEnvironment } from "./assertions";
import { categorizedAndLabeledEmployeeProps, categorizedEmployeeProps } from "../data/category.props";
import { mount } from "enzyme";
import DataTable, { IDataTableCategoryProps, IDataTableProps } from "../";
import DataTableBody, { DataTableCategorySection } from "../body";
import DataTableHeader from "../header";
import { ObjectOmit } from "typelevel-ts";

testEnvironment();

type EnforcedCategoryProps<T extends object = object> = (
	ObjectOmit<IDataTableProps<T>, keyof IDataTableCategoryProps<T>> & IDataTableCategoryProps<T>
);

function testTableForCategoriesBehaviour<T extends object = object>(props: EnforcedCategoryProps<T>) {
	shouldntThrowWithProps(props, DataTable);

	const wrapper = mount<EnforcedCategoryProps<T>>(<DataTable {...props}/>);
	const uniqueCategories = [...new Set(props.data.map(props.categoryAccessor))];

	it("should have as many categories as category sections", () => {
		expect(
			wrapper.find(DataTableBody).find(DataTableCategorySection).length,
		).to.be.equal(uniqueCategories.length);
	});

	it("every regular row inside a category section should have its category", () => {
		expect(
			wrapper.find(DataTableBody).find(DataTableCategorySection).everyWhere(
				(section) => {
					const sectionCategory = section.props().category;
					return section.find(DataTableRow).everyWhere(
						(row) => {
							const datum = row.props().datum;
							const rowCategory = wrapper.props().categoryAccessor(datum);
							return rowCategory === sectionCategory;
						},
					);
				},
			),
		).to.be.true;
	});

	it("every category section should start with a rule row", () => {
		expect(wrapper.find(DataTableBody).find(DataTableCategorySection).everyWhere(
			(section) => section.childAt(0).is(DataTableRuleRow),
		)).to.be.true;
	});

	it("every category section should have only one rule row", () => {
		expect(wrapper.find(DataTableBody).find(DataTableCategorySection).everyWhere(
			(section) => section.find(DataTableRuleRow).length === 1,
		)).to.be.true;
	});

	it("there should be category sections only inside DataTableBody", () => {
		expect(wrapper.find(DataTableHeader).find(DataTableCategorySection).length).to.be.equal(0);
	});

	it("should repass right category to each rule row", () => {
		expect(
			wrapper.find(DataTableCategorySection).everyWhere((section) => {
				return section.find(DataTableRuleRow).props().content === section.props().category;
			}),
		).to.be.true;
	});

	it("should repass label to rule rows", () => {
		expect(
			wrapper.find(DataTableRuleRow).everyWhere(
				(ruleRow) => ruleRow.props().label === wrapper.props().categoryLabel,
			),
		).to.be.true;
	});
}

describe("the main component with categories' enabled", () => {
	testTableForCategoriesBehaviour(categorizedEmployeeProps);
	testTableForCategoriesBehaviour(categorizedAndLabeledEmployeeProps);
});
