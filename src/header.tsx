import { headerCellClassName, rowClassName, tableHeaderClassName } from "./classes";
import * as React from "react";
import { IDataTableProps } from "./";
import * as classnames from "classnames";

export interface IDataTableHeaderProps<RowData extends object> extends Pick<IDataTableProps<RowData>, "columns" | "headerCellClassName" | "tableHeaderClassName" | "rowClassName"> {
}

export default class DataTableHeader<RowData extends object = object> extends React.PureComponent<IDataTableHeaderProps<RowData>, {}> {
	public render() {
		return (
			<thead
				className={classnames(tableHeaderClassName, this.props.tableHeaderClassName)}
			>
				<tr
					className={classnames(rowClassName, this.props.rowClassName)}
				>
					{
						this.props.columns.map((col) => (
							<th
								key={col.id}
								className={classnames(headerCellClassName, this.props.headerCellClassName)}
							>
								{col.label}
							</th>
						))
					}
				</tr>
			</thead>
		);
	}
}
