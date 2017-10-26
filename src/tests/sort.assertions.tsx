import DataTableHeader, { DataTableHeaderCell, SortArrow } from "../components/header";
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

		describe("<SortArrow/> click behaviour", function() {
			const sortableColumns = props.columns.filter((col) => col.sortFunction);

			for (const column of sortableColumns) {
				describe(`Column '${column.id}'`, function() {
					const columnWrapper = wrapper
						.find(DataTableHeader)
						.find(DataTableHeaderCell)
						.filterWhere((colWrapper) => colWrapper.props().column.id === column.id)
						.at(0);

					if (!columnWrapper) throw new Error("Column wrapper couldn't be found in tree");

					const sortArrowWrapper = columnWrapper.find(SortArrow);

					if (!sortArrowWrapper) throw new Error("<SortArrow/> couldn't be found inside sortable header cell");

					for (let i = 1; i < 3; i++) {
						it(`should have right behaviour for click #${i}`, function() {
							const wasActive = columnWrapper.props().isCurrentlySorted;
							const wasDescendant = columnWrapper.props().isSortingDescendant;

							sortArrowWrapper.simulate("click");
							wrapper.update();

							const isActive = columnWrapper.props().isCurrentlySorted;
							const isDescendant = columnWrapper.props().isSortingDescendant;

							expect(isActive, "should be active after clicking").to.be.true;

							if (wasActive) {
								expect(wasDescendant !== isDescendant, "should toggle ascendance since it was active before clicking").to.be.true;
							} else {
								expect(isDescendant, "shouldn't be descendant after click since it wasn't active before clicking").to.be.false;
							}
						});
					}
				});
			}
		});
	});
}
