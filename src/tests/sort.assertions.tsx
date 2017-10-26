import { Comparator } from "../utils/sorters";
import DataTableRow from "../components/row";
import DataTableBody from "../components/body";
import "jest";
import "./setup.ts";
import { shouldntThrowWithProps } from "./assertions";
import * as React from "react";
import { mount } from "enzyme";
import { expect } from "chai";

function isSorted<T>(arr: T[], sorter: Comparator<T>) {
	for (let i = 0; i < arr.length - 1; i++) {
		if (sorter(arr[i], arr[i + 1]) > 0) return false;
	}

	return true;
}

import DataTable, { IDataTableProps } from "../";

export function testTableSortFeaturesWithProps<T extends object = object>(props: IDataTableProps<T>, descriptor: string) {
	describe(`with props for the given features: ${descriptor}`, function() {
		shouldntThrowWithProps(props, DataTable);

		const wrapper = mount(<DataTable {...props}/>);

		const unorderedData = wrapper.find(DataTableBody).find(DataTableRow).map((row) => row.props().datum);
		const defaultSortedColumn = props.columns.find((col) => col.id === props.defaultSort);
		const defaultSortedSorter = defaultSortedColumn && defaultSortedColumn.sortFunction;

		if (props.defaultSort && defaultSortedColumn && defaultSortedSorter) {
			it("given a valid default sort referencing a sortable column, rows should be sorted", function () {
				expect(isSorted(unorderedData.map(defaultSortedColumn.accessor), defaultSortedSorter)).to.be.true;
			});
		} else {
			it("given none or invalid default sort, rows order shouldn't change", function() {
				expect(unorderedData.every((datum, i) => datum === props.data[i])).to.be.true;
			});
		}
	});
}
