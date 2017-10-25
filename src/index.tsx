import * as React from "react";
import * as classnames from "classnames";

import DataTableBody from "./body";
import * as classes from "./classes";
import DataTableHeader from "./header";
import { tableClassName } from "./classes";

export interface IColumn<RowData, CellData = any> {
	id: string;
	label: string | null;
	accessor: (v: RowData) => CellData;
	renderCell?: (v: CellData) => React.ReactNode;
}

export interface IDataTableCoreProps<RowData extends object> extends Partial<typeof classes> {
	data: RowData[];
	columns: Array<IColumn<RowData>>;

	idAccessor?: (datum: RowData) => string | number;

	children?: never;
}

export interface IDataTableCategoryProps<RowData extends object> {
	categoryAccessor: (row: RowData) => string;
	categoryLabel?: React.ReactNode;
}

export interface IDataTableProps<RowData extends object>
	extends IDataTableCoreProps<RowData>,
			Partial<IDataTableCategoryProps<RowData>> {
}

export default class DataTable<RowData extends object> extends React.Component<IDataTableProps<RowData>, {}> {
	public render() {
		return (
			<table
				className={classnames(tableClassName, this.props.tableClassName)}
			>
				<DataTableHeader
					columns={this.props.columns}
					rowClassName={this.props.rowClassName}
					headerCellClassName={this.props.headerCellClassName}
					tableHeaderClassName={this.props.tableHeaderClassName}
				/>

				<DataTableBody
					data={this.props.data}
					columns={this.props.columns}
					idAccessor={this.props.idAccessor}
					rowClassName={this.props.rowClassName}
					cellClassName={this.props.cellClassName}
					tableBodyClassName={this.props.tableBodyClassName}

					categoryLabel={this.props.categoryLabel}
					categoryAccessor={this.props.categoryAccessor}
				/>
			</table>
		);
	}
}
