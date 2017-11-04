import { DataTableHeaderCell } from "../../../components/header";
import { flattenColumns, getColumnsColSpan } from "../../../utils/helpers/columns";
import DataTableBody from "../../../components/body";
import DataTableHeader from "../../../components/header";
import "jest";
import "../../setup";
import { expect } from "chai";
import DataTableRow, { DataTableCell, parseDatum } from "../../../components/row";
import * as publicClasses from "../../../utils/publicClassNames";
import { shouldntThrowWithProps } from "../../assertions";

import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import DataTable, { IDataTableProps } from "../../../";

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

		const colCount = getColumnsColSpan(props.columns);
		const colElementCount = flattenColumns(props.columns).length;

		tableShouldHaveNRows(wrapper, props.data.length);
		tableShouldHaveNColumns(wrapper, colElementCount);
		tableRowsShouldHaveNCells(wrapper, colCount);
	});
}

function testTableContentWithProps<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("each column's content should resemble it's descriptor's label", function() {
		const props = wrapper.props();
		const columns = flattenColumns(props.columns);

		wrapper.find(DataTableHeader).find(DataTableHeaderCell).everyWhere((header) => {
			const id = header.props().column.id;
			const column = columns.find((col) => col.id === id);

			if (!column) throw new Error(`Could not found equivalent IColumn for column ${id}`);

			return header.text() === mount(<span>{column.label}</span>).text();
		});
	});

	it("each cell's content should resemble it's accessed and parsed value", function() {
		wrapper.find("tbody").find(DataTableRow).everyWhere((row) => {
			const rowProps = row.props();
			const cells = row.children();

			for (let i = 0; i < cells.length; i++) {
				const cell = cells.at(i);
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

function testTableBody<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>)  {
	describe("DataTableBody", () => {
		it("should render a single child", () => {
			expect(wrapper.find(DataTableBody).children().length).to.be.equal(1);
		});

		it("should render a single <tbody>", () => {
			expect(wrapper.find(DataTableBody).children().first().is("tbody")).to.be.true;
		});
	});
}

function testTableHeader<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>)  {
	describe("DataTableHeader", () => {
		it("should render a single child", () => {
			expect(wrapper.find(DataTableHeader).children().length).to.be.equal(1);
		});

		it("should render a single <thead>", () => {
			expect(wrapper.find(DataTableHeader).children().first().is("thead")).to.be.true;
		});
	});
}

function testTablePublicClassNames<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, classNames: Partial<typeof publicClasses>, qualifier: string)  {
	describe(`should have ${qualifier + " "}classes at the right tags`, function() {
		it(`should have ${qualifier + " "}class at <table>`, function() {
			if (classNames.tableClassName) {
				expect(wrapper.find("table").everyWhere((table) => table.hasClass(classNames.tableClassName!))).to.be.true;
			}
		});

		it(`should have ${qualifier + " "}class at <tbody>`, function() {
			if (classNames.tableBodyClassName) {
				expect(wrapper.find("tbody").everyWhere((tbody) => tbody.hasClass(classNames.tableBodyClassName!))).to.be.true;
			}
		});

		it(`should have ${qualifier + " "}class at <thead>`, function() {
			if (classNames.tableHeaderClassName) {
				expect(wrapper.find("thead").everyWhere((thead) => thead.hasClass(classNames.tableHeaderClassName!))).to.be.true;
			}
		});

		it(`should have ${qualifier + " "}class at <tr>`, function() {
			if (classNames.rowClassName) {
				expect(wrapper.find(DataTableRow).find("tr").everyWhere((tr) => tr.hasClass(classNames.rowClassName!))).to.be.true;
			}
		});

		it(`should have ${qualifier + " "}class at <td>`, function() {
			if (classNames.cellClassName) {
				expect(wrapper.find("td").everyWhere((td) => td.hasClass(classNames.cellClassName!))).to.be.true;
			}
		});

		it(`should have ${qualifier + " "}class at <th>`, function() {
			if (classNames.headerCellClassName) {
				expect(wrapper.find("th").everyWhere((th) => th.hasClass(classNames.headerCellClassName!))).to.be.true;
			}
		});
	});
}

function testTableDefaultClasses<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	testTablePublicClassNames(wrapper, publicClasses, "default");
}

function tableShouldHaveTBody<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("should have a single <tbody> tag", function() {
		expect(wrapper.find("tbody")).to.have.length(1);
	});
}

function tableShouldHaveTHead<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("should have a single <thead> tag", function() {
		expect(wrapper.find("thead")).to.have.length(1);
	});
}

function tableShouldHaveNRows<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	it(`should have ${n} rows`, function() {
		expect(
			wrapper
				.find("tbody")
				.find(DataTableRow)
				.not({ isAggregated: true }),
		).to.have.length(n);
	});
}

function tableShouldHaveNColumns<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	it(`should have ${n} columns`, function() {
		expect(
			wrapper.find(DataTableHeader).find(DataTableHeaderCell),
		).to.have.length(n);
	});
}

function tableRowsShouldHaveNCells<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	describe(`each row should have ${n} cells`, function() {
		const rows = wrapper.find("tbody").find(DataTableRow).map((v) => v);

		for (const i in rows) {
			const row = rows[i];
			it(`row #${i + 1}`, () => {
				expect(row.find("tr").first().find(DataTableCell)).to.have.length(n);
			});
		}
	});
}

function testIdAccessor<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("each row should have id accessor as key", function() {
		expect(
			wrapper
				.find("tbody")
				.find(DataTableRow)
				.everyWhere((row) => {
					const props = wrapper.props();
					const rowProps = row.props();

					return row.key() === props.idAccessor(rowProps.datum);
				}),
		);
	});
}

export function testTableCoreFeaturesWithProps<T extends object = object>(props: IDataTableProps<T>) {
	shouldntThrowWithProps(props, DataTable);
	const wrapper = mount(<DataTable {...props}/> );

	tableShouldRenderCorrectTags(wrapper);

	testTableDefaultClasses(wrapper);
	testTablePublicClassNames(wrapper, props, "props'");

	testTableContentWithProps(wrapper);
	testIdAccessor(wrapper);

	testTableBody(wrapper);
	testTableHeader(wrapper);
}
