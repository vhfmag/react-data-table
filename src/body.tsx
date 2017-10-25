import * as React from "react";
import * as classnames from "classnames";
import DataTableRow from "./row";
import { IDataTableProps } from "./";
import { tableBodyClassName } from "./classes";

export interface IDataTableHeaderProps<RowData extends object> extends Pick<IDataTableProps<RowData>, "columns" | "tableBodyClassName" | "cellClassName" | "rowClassName" | "idAccessor" | "categoryAccessor" | "data"> {
}

export default class DataTableBody<RowData extends object = object> extends React.PureComponent<IDataTableHeaderProps<RowData>, {}> {
	public render() {
		return (
			<tbody
				className={classnames(tableBodyClassName, this.props.tableBodyClassName)}
			>
				{
					this.props.data.map((rowData, i) => (
						<DataTableRow
							datum={rowData}
							columns={this.props.columns}
							rowClassName={this.props.rowClassName}
							cellClassName={this.props.cellClassName}
							key={this.props.idAccessor ? this.props.idAccessor(rowData) : i}
						/>
					))
				}
			</tbody>
		);
	}
}
