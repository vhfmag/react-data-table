import { SelectionCell } from "../../../components/cell";
import { StatefulSelectedWrapper } from "../../../helpers/tableWrapper";
import { DataTableHeaderSelectionCell } from "../../../components/header";
import DataTableHeader from "../../../components/header";
import DataTableBody from "../../../components/body";
import DataTableRow, { DataTableCategorySelectionCell, DataTableBodySelectionCell } from "../../../components/row";
import DataTable, { IDataTableProps } from "../../../";
import "jest";
import "../../setup";
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";

import * as React from "react";

function getWrappers<T extends object>(parentWrapper: ReactWrapper<IDataTableProps<T>>) {
	const wrapper = parentWrapper.find(DataTable);
	const parent = parentWrapper.instance() as StatefulSelectedWrapper<T>;

	return { parent, wrapper };
}

export function testTableRowSelectionWithProps<T extends object = object>(props: Readonly<IDataTableProps<T>>) {
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

			describe("each DataTableCategorySelectionCell", () => {
				const selectionCells = wrapper.find(DataTableBody).find(DataTableCategorySelectionCell).map((v) => v);

				for (const selectionCell of selectionCells) {
					describe(`selection cell of category '${selectionCell.props().category}'`, function () {
						describe("onSelect should be called on change", () => {
							const { category, selected } = selectionCell.props();

							parent.onSelect.reset();
							selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !selected } });
							expect(parent.onSelect.called, "onSelect should be called").to.be.true;

							updateWrappers();

							const { selected: newSelected } = wrapper.find(DataTableBody).find(DataTableCategorySelectionCell).find({ category }).props();
							expect(newSelected, "selected props should have changed after react update").not.to.be.equal(selected);

							selectionCell.find(SelectionCell).find("input").simulate("change", { target: { checked: !newSelected } });
							updateWrappers();

							const { selected: renewSelected } = wrapper.find(DataTableBody).find(DataTableCategorySelectionCell).find({ category }).props();
							expect(renewSelected, "selected props should change again after second click").to.be.equal(selected);
						});
					});
				}
			});

			describe("the DataTableHeaderSelectionCell", () => {
				if (wrapper.props().data.length > 0) {
					describe("given there are more than zero rows", () => {
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
				} else {
					// TODO: check if the input is disabled
				}
			});

			// TODO: check if every DataTableCategoryRow has a selection cell and check if category's rows are toggled
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
