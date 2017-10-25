import DataTableRow, { parseDatum } from "../row";
import "jest";
import { expect } from "chai";

import * as React from "react";
import { shouldntThrowWithProps, testEnvironment } from "./assertions";
import { emptyProps, employeePropsWithId, employeePropsWithoutId } from "../data/core.props";

import { mount, ReactWrapper } from "enzyme";
import DataTable, { IDataTableProps } from "../";

import "./setup";

import {
	tableRowsShouldHaveNCells,
	tableShouldHaveNColumns,
	tableShouldHaveNRows,
	tableShouldHaveTBody,
	tableShouldHaveTHead,
	testIdAccessor,
	testTableBody,
	testTableClasses,
	testTableDefaultClasses,
	testTableHeader,
} from "./core.assertions";

function tableShouldRenderTableTag<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("should have a single <table> tag", function() {
		expect(wrapper.find("table")).to.have.length(1);
	});
}

function tableShouldRenderCorrectTags<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	const props = wrapper.props();

	describe("should render correct table-related tags", () => {
		tableShouldHaveTBody(wrapper);
		tableShouldHaveTHead(wrapper);
		tableShouldRenderTableTag(wrapper);

		tableShouldHaveNRows(wrapper, props.data.length);
		tableShouldHaveNColumns(wrapper, props.columns.length);
		tableRowsShouldHaveNCells(wrapper, props.columns.length);
	});
}

function testTableWithProps<T extends object = object>(props: IDataTableProps<T>) {
	shouldntThrowWithProps(props, DataTable);
	const wrapper = mount(<DataTable {...props}/>);

	tableShouldRenderCorrectTags(wrapper);

	testTableDefaultClasses(wrapper);
	testTableClasses(wrapper, props, "props'");

	testTableContentWithProps(wrapper);
	testIdAccessor(wrapper);

	testTableBody(wrapper);
	testTableHeader(wrapper);
}

function testTableContentWithProps<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("each column's content should resemble it's descriptor's label", function() {
		const props = wrapper.props();

		wrapper.find("thead th").everyWhere((header) => {
			const column = props.columns.find((col) => col.id === header.key());

			if (!column) throw new Error("Column descriptor not found");

			return header.text() === mount(<span>{column.label}</span>).text();
		});
	});

	it("each cell's content should resemble it's accessed and parsed value", function() {
		wrapper.find("tbody").find(DataTableRow).everyWhere((row) => {
			const rowProps = row.props();
			const cells = row.children();

			for (let i = 0; i < cells.length; i++) {
				const cell = cells.childAt(i);
				const column = rowProps.columns[i];
				const content = parseDatum(rowProps.datum, column);

				if (cell.text() !== mount(<span>{content}</span>).text()) {
					return false;
				}
			}

			return true;
		});
	});
}

testEnvironment();

describe("the main component", function() {
	describe("with empty props", function() {
		testTableWithProps(emptyProps);
	});

	describe("with employee props without ids", function() {
		testTableWithProps(employeePropsWithoutId);
	});

	describe("with employee props with ids", function() {
		testTableWithProps(employeePropsWithId);
	});
});
