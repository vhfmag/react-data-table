import DataTableRow, { parseDatum } from "../row";
import "jest";
import { expect } from "chai";

import * as React from "react";
import { emptyProps, employeePropsWithId, employeePropsWithoutId } from "../data/core.props";

import { configure, mount, ReactWrapper } from "enzyme";
import DataTable, { IDataTableProps } from "../";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import {
	tableRowsShouldHaveNCells,
	tableShouldHaveNColumns,
	tableShouldHaveNRows,
	tableShouldHaveTBody,
	tableShouldHaveTHead,
	testTableClasses,
	testTableDefaultClasses,
	testIdAccessor,
} from "./core.assertions";

function shouldntThrowWithProps<Props>(props: Props, Component: React.ComponentClass<Props>) {
	it("should pass shallow smoke test", function() {
		mount(<Component {...props}/>);
	});
}

function tableShouldRenderSuccesfully<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("should have a single <table> tag", function() {
		expect(wrapper.find("table")).to.have.length(1);
	});
}

function testTableWithProps<T extends object = object>(props: IDataTableProps<T>) {
	shouldntThrowWithProps(props, DataTable);
	const wrapper = mount(<DataTable {...props}/>);

	tableShouldRenderSuccesfully(wrapper);

	testTableDefaultClasses(wrapper);
	testTableClasses(wrapper, props, "props'");

	tableShouldHaveTBody(wrapper);
	tableShouldHaveTHead(wrapper);

	tableShouldHaveNRows(wrapper, props.data.length);
	tableShouldHaveNColumns(wrapper, props.columns.length);
	tableRowsShouldHaveNCells(wrapper, props.columns.length);

	testTableContentWithProps(wrapper);
	testIdAccessor(wrapper);
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

describe("the environment", function() {
	it("works, hopefully", function() {
		expect(true).to.be.true;
	});
});

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
