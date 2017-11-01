import { DataTableHeaderCell } from "../../../components/header";
import { getColumnsColSpan, getColumnsMaxRowSpan } from "../../../utils/helpers/columns";
import DataTable, { IColumn, IDataTableProps } from "../../../";
import "jest";
import "../../setup";
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";

import * as React from "react";

function testColumnsForRowSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>, wrapper: ReactWrapper, level: number = 0) {
	const maxRowSpan = getColumnsMaxRowSpan(cols);

	for (const col of cols) {
		describe(`Column '${col.id}' of level ${level}`, function() {
			const colWrapper = wrapper.find(DataTableHeaderCell).filterWhere((headerCell) => headerCell.props().column.id === col.id);

			if (!colWrapper) throw new Error(`Couldn't find corresponding element for column '${col.id}'`);

			if (col.columns) {
				const nestedColumns = col.columns;
				const nestedRowSpan = getColumnsMaxRowSpan(nestedColumns);

				it(`For parent column, row span should be equal to level's span (${maxRowSpan}) - children's span (${nestedRowSpan})`, function() {
					expect(colWrapper.find("th").props().rowSpan).to.be.equal(maxRowSpan - nestedRowSpan);
				});

				testColumnsForRowSpan(nestedColumns, wrapper, level + 1);
			} else {
				it(`For final column, row span should be equal to level's span (${maxRowSpan})`, function() {
					expect(colWrapper.find("th").props().rowSpan).to.be.equal(maxRowSpan);
				});
			}
		});
	}
}

function testColumnsForColSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>, wrapper: ReactWrapper, level: number = 0) {
	for (const col of cols) {
		describe(`Column '${col.id}' of level ${level}`, function() {
			const colWrapper = wrapper.find(DataTableHeaderCell).filterWhere((headerCell) => headerCell.props().column.id === col.id);

			if (!colWrapper) throw new Error(`Couldn't find corresponding element for column '${col.id}'`);

			if (col.columns) {
				const nestedColumns = col.columns;

				describe("For parent column, column span should be equal to the sum of its children's", function() {
					const nestedColSpan = getColumnsColSpan(nestedColumns);
					expect(colWrapper.find("th").props().colSpan).to.be.equal(nestedColSpan);
				});

				testColumnsForColSpan(nestedColumns, wrapper, level + 1);
			} else {
				describe("For final column, column span should be equal to 1", function() {
					expect(colWrapper.find("th").props().colSpan).to.be.equal(1);
				});
			}
		});
	}
}

export function testTableNestedColumnsFeaturesWithProps<T extends object = object>(props: Readonly<IDataTableProps<T>>) {
	if (!props.columns.some((col) => !!col.columns)) throw new TypeError("Invalid props for nested columns test: no nested columns");

	const wrapper = mount<IDataTableProps<T>>(<DataTable {...props}/>);

	describe("every column should have the right row span", function() {
		testColumnsForRowSpan(props.columns, wrapper);
	});

	describe("every column should have the right col span", function() {
		testColumnsForColSpan(props.columns, wrapper);
	});
}
