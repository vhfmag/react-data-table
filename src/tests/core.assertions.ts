import "jest";
import { expect } from "chai";
import DataTableRow from "../row";
import { IDataTableProps } from "..";
import { ReactWrapper } from "enzyme";
import * as classes from "../classes";

export function testTableClasses<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, classNames: Partial<typeof classes>, qualifier: string)  {
	describe(`should have the right ${qualifier + " "}classes at the right tags`, function() {
		it(`should have the right ${qualifier + " "}class at <table>`, function() {
			if (classNames.tableClassName) {
				expect(wrapper.find("table").everyWhere((table) => table.hasClass(classNames.tableClassName!))).to.be.true;
			}
		});

		it(`should have the right ${qualifier + " "}class at <tbody>`, function() {
			if (classNames.tableBodyClassName) {
				expect(wrapper.find("tbody").everyWhere((tbody) => tbody.hasClass(classNames.tableBodyClassName!))).to.be.true;
			}
		});

		it(`should have the right ${qualifier + " "}class at <thead>`, function() {
			if (classNames.tableHeaderClassName) {
				expect(wrapper.find("thead").everyWhere((thead) => thead.hasClass(classNames.tableHeaderClassName!))).to.be.true;
			}
		});

		it(`should have the right ${qualifier + " "}class at <tr>`, function() {
			if (classNames.rowClassName) {
				expect(wrapper.find("tr").everyWhere((tr) => tr.hasClass(classNames.rowClassName!))).to.be.true;
			}
		});

		it(`should have the right ${qualifier + " "}class at <td>`, function() {
			if (classNames.cellClassName) {
				expect(wrapper.find("td").everyWhere((td) => td.hasClass(classNames.cellClassName!))).to.be.true;
			}
		});

		it(`should have the right ${qualifier + " "}class at <th>`, function() {
			if (classNames.headerCellClassName) {
				expect(wrapper.find("th").everyWhere((th) => th.hasClass(classNames.headerCellClassName!))).to.be.true;
			}
		});
	});
}

export function testTableDefaultClasses<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	testTableClasses(wrapper, classes, "default");
}

export function tableShouldHaveTBody<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it(`should have a single <tbody> tag`, function() {
		expect(wrapper.find("tbody")).to.have.length(1);
	});
}

export function tableShouldHaveTHead<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it(`should have a single <thead> tag`, function() {
		expect(wrapper.find("thead")).to.have.length(1);
	});
}

export function tableShouldHaveNRows<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	it(`should have ${n} rows`, function() {
		expect(
			wrapper
				.find("tbody")
				.find(DataTableRow),
		).to.have.length(n);
	});
}

export function tableShouldHaveNColumns<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	it(`should have ${n} columns`, function() {
		expect(
			wrapper.find("thead").find("tr").find("th"),
		).to.have.length(n);
	});
}

export function tableRowsShouldHaveNCells<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>, n: number) {
	it(`each row should have ${n} cells`, function() {
		expect(
			wrapper
				.find("tbody")
				.find(DataTableRow)
				.everyWhere((row) => row.find("td").length === n),
		).to.be.true;
	});
}

export function testIdAccessor<T extends object = object>(wrapper: ReactWrapper<IDataTableProps<T>>) {
	it("each row should have id accessor as key or row's index as fallback", function() {
		expect(
			wrapper
				.find("tbody")
				.find(DataTableRow)
				.everyWhere((row) => {
					const props = wrapper.props();
					const rowProps = row.props();

					if (props.idAccessor) {
						return row.key() === props.idAccessor(rowProps.datum);
					} else {
						return !isNaN(Number(row.key()));
					}
				}),
		);
	});
}
