import { SelectionCell } from "./cell";
import { IColumn, IDataTableProps } from "..";
import * as React from "react";
import * as classes from "../utils/publicClassNames";
import classnames from "classnames";

export interface IDataTableRowProps
	<RowData extends object = object>
	extends Pick<IDataTableProps<RowData>, "columns" | "rowClassName" | "cellClassName" | "selectable"> {
	id: string;
	datum: RowData;
	selected?: boolean;
	onSelect?(id: string): void;
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
					this.props.onSelect && this.props.selectable ? (
						<DataTableBodySelectionCell
							cellClassName={this.props.cellClassName}
							id={this.props.id}
							onSelect={this.props.onSelect}
							selected={!!this.props.selected}
						/>
					) : null
				}

				{
					this.props.columns.map((col) => (
						<DataTableCell
							column={col}
							key={col.id}
							datum={this.props.datum}
							cellClassName={this.props.cellClassName}
						/>
					))
				}
			</tr>
		);
	}
}

export interface IDataTableCellProps<RowData extends object>
	extends Pick<IDataTableRowProps<RowData>, "cellClassName" | "datum"> {
	column: IColumn<RowData>;
}

export class DataTableCell<RowData extends object> extends React.PureComponent<IDataTableCellProps<RowData>> {
	public render() {
		return (
			<td
				className={classnames(classes.cellClassName, this.props.cellClassName)}
			>
				{parseDatum(this.props.datum, this.props.column)}
			</td>
		);
	}
}

export interface IDataTableRuleRowProps extends Partial<Pick<typeof classes, "ruleRowClassName" | "cellClassName">> {
	colSpan: number;
	content: string;
	label?: React.ReactNode;
	children?: never;
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

export interface IDataTableBodySelectionCellProps
	extends Pick<IDataTableRowProps, "cellClassName"> {
	id: string;
	selected: boolean;
	onSelect(id: string, selected: boolean): void;
}

export class DataTableBodySelectionCell extends React.PureComponent<IDataTableBodySelectionCellProps> {
	private onSelect = (selected: boolean) => {
		this.props.onSelect(this.props.id, selected);
	}

	public render() {
		return (
			<SelectionCell
				selected={!!this.props.selected}
				onChange={this.onSelect}
				className={classnames(this.props.cellClassName, classes.cellClassName)}
			/>
		);
	}
}
