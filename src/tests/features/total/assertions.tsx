import "jest";
import "../../setup";
import * as React from "react";
import { mount } from "enzyme";
// import { expect } from "chai";
import DataTable, { IDataTableProps } from "../../../";

export function testDataTableTotalFeatureWithProps<RowData extends object>(props: IDataTableProps<RowData>) {
	const wrapper = mount(<DataTable {...props}/>);

	if (props);
}
