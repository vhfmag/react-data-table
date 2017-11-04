import DataTableRow from "../../../components/row";
import "jest";
import "../../setup";
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { expect } from "chai";
import DataTable, { IDataTableProps } from "../../../";
import DataTableBody, { DataTableCategorySection } from "../../../components/body";
import { IDataTableRowProps } from "../../../components/row";

function testForHiddenTotal(wrapper: ReactWrapper, shouldHide: boolean | undefined, kind: "body" | "category") {
	const propName = kind === "body" ? "hideBodyTotal" : kind === "category" ? "hideCategoryTotal" : undefined;

	if (!propName) throw new Error("Invalid call for testForHiddenTotal: kind should be body or category, but is " + kind);

	describe("since has totalAccessor and one or more rows", () => {
		const totalRowWrapper = wrapper.findWhere((el) => {
			const isCategory = (el.props() as IDataTableRowProps).isCategory;

			return el.is(DataTableRow) && el.is({ isAggregated: true }) && (kind === "body" ? !isCategory : !!isCategory);
		});

		if (shouldHide) {
			describe(`since ${propName} is true`, () => {
				it("shouldn't render a DataTableRow with isAggregated={true}", () => {
					expect(totalRowWrapper.exists()).to.be.false;
				});
			});
		} else {
			describe(`since ${propName} is false`, () => {
				it("should render a DataTableRow with isAggregated={true}", () => {
					expect(totalRowWrapper).to.have.length(1);
				});
			});
		}
	});
}

export function testDataTableTotalFeatureWithProps<RowData extends object>(props: IDataTableProps<RowData>) {
	const wrapper = mount(<DataTable {...props}/>);

	if (props.totalAccessor) {
		const tableBody = wrapper.find(DataTableBody).find("tbody");

		if (tableBody.children().length > 0) {
			testForHiddenTotal(tableBody, props.hideBodyTotal, "body");

			const categorySections = wrapper.find(DataTableCategorySection).map((v) => v);
			for (const categorySection of categorySections) {
				describe(`For category '${categorySection.props().category}'`, () => {
					if (!categorySection.isEmpty()) {
						testForHiddenTotal(categorySection, props.hideCategoryTotal, "category");
					}
				});
			}
		}
	}
}
