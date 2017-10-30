import { flattenColumns } from "../../../utils/helpers/columns";
import DataTableHeader, { DataTableHeaderCell, SortArrow } from "../../../components/header";
import { Comparator } from "../../../utils/sorters";
import DataTableBody from "../../../components/body";
import "jest";
import "../../setup";
import { shouldntThrowWithProps } from "../../assertions";
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { expect } from "chai";

function isSorted<T>(arr: ReadonlyArray<T>, sorter: Comparator<T>, descendant?: boolean) {
	for (let i = 0; i < arr.length - 1; i++) {
		if ((descendant ? -1 : 1) * sorter(arr[i], arr[i + 1]) > 0) return false;
	}

	return true;
}

import DataTable, { IDataTableProps } from "../../../";

function getColumnWrapperById<T extends object>(wrapper: ReactWrapper<IDataTableProps<T>>, columnId: string) {
	return wrapper
		.find(DataTableHeader)
		.find(DataTableHeaderCell)
		.filterWhere((colWrapper) => colWrapper.props().column.id === columnId)
		.at(0);
}

export function testTableSortFeaturesWithProps<T extends object = object>(props: IDataTableProps<T>) {
	shouldntThrowWithProps(props, DataTable);

	let wrapper = mount(<DataTable {...props}/>);

	const columns = flattenColumns(props.columns);
	const unorderedData = wrapper.find(DataTableBody).props().data;
	const defaultSortedColumn = columns.find((col) => col.id === props.defaultSort);
	const defaultSortedSorter = defaultSortedColumn && defaultSortedColumn.sortFunction;

	const sortableColumns = columns.filter((col) => !!col.sortFunction);

	if (props.defaultSort && defaultSortedColumn && defaultSortedSorter) {
		it("given a valid default sort referencing a sortable column, rows should be sorted", function () {
			expect(isSorted(unorderedData.map(defaultSortedColumn.accessor), defaultSortedSorter)).to.be.true;
		});
	} else {
		it("given none or invalid default sort, rows order shouldn't change", function() {
			expect(unorderedData.every((datum, i) => datum === props.data[i])).to.be.true;
		});
	}

	describe("every sortable column should have a <SortArrow/>", function() {
		for (const column of sortableColumns) {
			describe(`Column '${column.id}'`, function() {
				const headerCellWrapper =
					wrapper
						.find(DataTableHeaderCell)
						.filterWhere((headerCell) => headerCell.props().column.id === column.id)
						.first();

				if (!headerCellWrapper || !headerCellWrapper.exists()) throw new Error("Couldn't find an element for the given column");

				expect(headerCellWrapper.find(SortArrow).exists()).to.be.true;
			});
		}
	});

	describe("<SortArrow/> click behaviour", function() {
		for (const column of sortableColumns) {
			describe(`Column '${column.id}'`, function() {

				for (let i = 1; i < 4; i++) {
					it(`should have right behaviour for click #${i}`, function() {
						const columnWrapper = getColumnWrapperById(wrapper, column.id);
						if (!columnWrapper) throw new Error("Column wrapper couldn't be found in tree");

						const sortArrowWrapper = columnWrapper.find(SortArrow);
						if (!sortArrowWrapper) throw new Error("<SortArrow/> couldn't be found inside sortable header cell");

						const wasActive = columnWrapper.props().isCurrentlySorted;
						const wasDescendant = columnWrapper.props().isSortingDescendant;

						sortArrowWrapper.simulate("click");
						wrapper = wrapper.update();

						const updatedColumnWrapper = getColumnWrapperById(wrapper, column.id);

						const isActive = updatedColumnWrapper.props().isCurrentlySorted;
						const isDescendant = updatedColumnWrapper.props().isSortingDescendant;

						expect(isActive, "should be active after clicking").to.be.true;

						if (wasActive) {
							expect(wasDescendant !== isDescendant, "should toggle ascendance since it was active before clicking").to.be.true;
						} else {
							expect(isDescendant, "shouldn't be descendant after click since it wasn't active before clicking").to.be.false;
						}

						const accessor = updatedColumnWrapper.props().column.accessor;
						const sorter = updatedColumnWrapper.props().column.sortFunction!;
						const sortedRows = wrapper.find(DataTableBody).props().data;
						expect(
							isSorted(
								sortedRows,
								(t1, t2) => sorter(accessor(t1), accessor(t2)),
								isDescendant,
							),
							"results should be sorted after clicking",
						);
					});
				}
			});
		}
	});
}
