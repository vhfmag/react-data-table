import { SelectionCell } from "../../../components/cell";
import { StatefulSelectedWrapper } from "../../../helpers/tableWrapper";
import { DataTableHeaderSelectionCell } from "../../../components/header";
import DataTableHeader from "../../../components/header";
import DataTableBody from "../../../components/body";
import DataTableRow, { DataTableBodySelectionCell } from "../../../components/row";
import DataTable, { IDataTableProps } from "../../../";
import "jest";
import "../../setup";
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";

import * as React from "react";

import { shouldntThrowWithProps } from "../../assertions";

function getWrappers<T extends object>(parentWrapper: ReactWrapper<IDataTableProps<T>>) {
	const wrapper = parentWrapper.find(DataTable);
	const parent = parentWrapper.instance() as StatefulSelectedWrapper<T>;

	return { parent, wrapper };
}

export function testTableRowSelectionWithProps<T extends object = object>(props: Readonly<IDataTableProps<T>>) {
	shouldntThrowWithProps(props, DataTable);

	const parentWrapper = mount(<StatefulSelectedWrapper {...props}/>);
	let { parent, wrapper } = getWrappers(parentWrapper);

	function updateWrappers() {
		const wrappers = getWrappers(parentWrapper.update());

		parent = wrappers.parent;
		wrapper = wrappers.wrapper;
	}

	if (props.selectable) {
		describe("since is selectable", () => {
			it("each row should have a DataTableBodySelectionCell", () => {
				expect(
					wrapper
						.find(DataTableBody)
						.find(DataTableRow)
						.everyWhere((row) => row.find(DataTableBodySelectionCell).exists()),
				).to.be.true;
			});

			it("header should have a single DataTableHeaderSelectionCell", () => {
				expect(wrapper.find(DataTableHeader).find(DataTableHeaderSelectionCell)).to.have.length(1);
			});

			describe("each DataTableBodySelectionCell", () => {
				const selectionCells = wrapper.find(DataTableBody).find(DataTableBodySelectionCell).map((v) => v);

				for (const selectionCell of selectionCells) {
					describe(`selection cell of row '${selectionCell.props().id}'`, function () {
						describe("onSelect should be called on change", () => {
							const { id, selected } = selectionCell.props();

							parent.onSelect.reset();
							selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !selected } });
							expect(parent.onSelect.called, "onSelect should be called").to.be.true;

							updateWrappers();

							const { selected: newSelected } = wrapper.find(DataTableBody).find(DataTableBodySelectionCell).find({ id }).props();
							expect(newSelected, "selected props should have changed after react update").not.to.be.equal(selected);

							selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !newSelected } });
							updateWrappers();

							const { selected: renewSelected } = wrapper.find(DataTableBody).find(DataTableBodySelectionCell).find({ id }).props();
							expect(renewSelected, "selected props should change again after second click").to.be.equal(selected);
						});
					});
				}
			});

			describe("the DataTableHeaderSelectionCell", () => {
				it("onSelect should be called on change", () => {
					const selectionCell = wrapper.find(DataTableHeader).find(DataTableHeaderSelectionCell);
					const { selected } = selectionCell.props();

					parent.onSelect.reset();
					selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !selected } });
					expect(parent.onSelect.called).to.be.true;

					updateWrappers();
					const { selected: newSelected } = wrapper.find(DataTableHeader).find(DataTableHeaderSelectionCell).props();
					expect(newSelected, "selected props should have changed after react update").not.to.be.equal(selected);

					selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !newSelected } });
					updateWrappers();

					const { selected: renewSelected } = wrapper.find(DataTableHeader).find(DataTableHeaderSelectionCell).props();
					expect(renewSelected, "selected props should change again after second click").to.be.equal(selected);
				});
			});
		});
	} else {
		describe("since is not selectable", () => {
			it("rows shouldn't have any DataTableBodySelectionCell", () => {
				expect(wrapper.find(DataTableBodySelectionCell)).to.have.length(0);
			});

			it("header should have no DataTableHeaderSelectionCell", () => {
				expect(wrapper.find(DataTableHeader).find(DataTableHeaderSelectionCell)).to.have.length(0);
			});
		});
	}
}
