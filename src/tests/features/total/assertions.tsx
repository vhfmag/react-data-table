import "jest";
import "../../setup";
import { shouldntThrowWithProps } from "../../assertions";
import * as React from "react";
import { mount } from "enzyme";
// import { expect } from "chai";
import DataTable, { IDataTableProps } from "../../../";

export function testDataTableTotalFeatureWithProps<RowData extends object>(props: IDataTableProps<RowData>) {
	shouldntThrowWithProps(props, DataTable);

	const wrapper = mount(<DataTable {...props}/>);

	// describe("");
}
