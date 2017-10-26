import { IColumn, IDataTableProps } from "..";
import * as React from "react";
import * as classes from "../utils/classes";
import * as classnames from "classnames";

export interface IDataTableRowProps
	<RowData extends object = object>
	extends Pick<IDataTableProps<RowData>, "columns" | "rowClassName" | "cellClassName"> {
	datum: RowData;
}

function accessDatum<T extends object = object, Z = any>(datum: T, column: IColumn<T, Z>): Z {
	return column.accessor(datum);
}

function parseAccessedData<T extends object = object, Z = any>(accessed: Z, column: IColumn<T, Z>) {
	return column.renderCell ? column.renderCell(accessed) : accessed;
}

export function parseDatum<T extends object = object, Z = any>(datum: T, column: IColumn<T, Z>) {
	return parseAccessedData(accessDatum(datum, column), column);
}

export default class DataTableRow<RowData extends object = object> extends React.PureComponent<IDataTableRowProps<RowData>, {}> {
	public render() {
		return (
			<tr
				className={classnames(classes.rowClassName, this.props.rowClassName)}
			>
				{
					this.props.columns.map((col) => (
						<td
							className={classnames(classes.cellClassName, this.props.cellClassName)}
							key={col.id}
						>
							{parseDatum(this.props.datum, col)}
						</td>
					))
				}
			</tr>
		);
	}
}

export interface IDataTableRuleRowProps extends Partial<Pick<typeof classes, "ruleRowClassName" | "cellClassName">> {
	colSpan: number;
	content: string;
	label?: React.ReactNode;
}

export class DataTableRuleRow extends React.PureComponent<IDataTableRuleRowProps, {}> {
	public render() {
		return (
			<tr
				className={classnames(this.props.ruleRowClassName, classes.ruleRowClassName)}
			>
				<td
					colSpan={this.props.colSpan}
					className={classnames(this.props.cellClassName, classes.cellClassName)}
				>
					{this.props.label && (<span><b>{this.props.label}</b>: </span>)}
					{this.props.content}
				</td>
			</tr>
		);
	}
}
