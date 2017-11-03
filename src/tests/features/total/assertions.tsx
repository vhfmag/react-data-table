import DataTableRow from "../../../components/row";
import "jest";
import "../../setup";
import * as React from "react";
import { mount } from "enzyme";
import { expect } from "chai";
import DataTable, { IDataTableProps } from "../../../";
import DataTableBody from "../../../components/body";

export function testDataTableTotalFeatureWithProps<RowData extends object>(props: IDataTableProps<RowData>) {
	const wrapper = mount(<DataTable {...props}/>);

	if (props.totalAccessor) {
		const firstBodyChild = wrapper.find(DataTableBody).find("tbody").childAt(0);

		if (firstBodyChild.exists()) {
			describe("since has totalAccessor and one or more rows", () => {
				if (props.hideBodyTotal) {
					describe("since hideBodyTotal is false", () => {
						it("shouldn't render a DataTableRow with isAggregated={true} as first child", () => {
							expect(!firstBodyChild.is(DataTableRow) || !firstBodyChild.is({ isAggregated: true })).to.be.true;
						});
					});
				} else {
					describe("since hideBodyTotal is true", () => {
						it("should render a DataTableRow with isAggregated={true} as first child", () => {
							expect(firstBodyChild.is(DataTableRow), "isn't DataTableRow").to.be.true;
							expect(firstBodyChild.is({ isAggregated: true }), "hasn't isAggregated").to.be.true;
						});
					});
				}
			});
		}
	}
}
