import { isSome } from "../utils/sorters";
import { SelectionCell } from "./cell";
import { IColumn, IDataTableProps } from "..";
import * as React from "react";
import * as classes from "../utils/publicClassNames";
import classnames from "classnames";

export interface IDataTableRowProps
	<RowData extends object = object>
	extends Pick<IDataTableProps<RowData>, "columns" | "rowClassName" | "cellClassName" | "selectable" | "totalRowClassName" | "categoryRowClassName"> {
	id: string;
	datum: RowData;
	selected?: boolean;
	isCategory?: boolean;
	isAggregated?: boolean;
	onSelect?(id: string): void;
}

function accessDatum<T extends object = object, Z = any>(datum: T, column: IColumn<T, Z>): Z | null | undefined {
	return column.accessor(datum);
}

function parseAccessedData<T extends object = object, Z = any>(accessed: Z, column: IColumn<T, Z>, isAggregated?: boolean) {
	const renderCell = isAggregated && column.renderAggregate || column.renderCell;

	return renderCell ? renderCell(accessed) : accessed;
}

export function parseDatum<T extends object = object, Z = any>(datum: T, column: IColumn<T, Z>, isAggregated?: boolean) {
	return parseAccessedData(accessDatum(datum, column), column, isAggregated);
}

export default class DataTableRow<RowData extends object = object> extends React.PureComponent<IDataTableRowProps<RowData>, {}> {
	public render() {
		return (
			<tr
				className={
					classnames(
						classes.rowClassName, this.props.rowClassName,
						this.props.isAggregated && classes.totalRowClassName, this.props.isAggregated && this.props.totalRowClassName,
						this.props.isCategory && classes.categoryRowClassName, this.props.isCategory && this.props.categoryRowClassName,
					)
				}
			>
				{
					this.props.selectable ? (
						this.props.onSelect ? (
							<DataTableBodySelectionCell
								cellClassName={this.props.cellClassName}
								id={this.props.id}
								onSelect={this.props.onSelect}
								selected={!!this.props.selected}
							/>
						) : !this.props.isCategory ? (
							<td/>
						) : null
					) : null
				}

				{
					this.props.columns.map((col) => (
						<DataTableCell
							column={col}
							key={col.id}
							datum={this.props.datum}
							isAggregated={this.props.isAggregated}
							cellClassName={this.props.cellClassName}
						/>
					))
				}
			</tr>
		);
	}
}

export interface IDataTableCellProps<RowData extends object>
	extends Pick<IDataTableRowProps<RowData>, "cellClassName" | "datum" | "isAggregated"> {
	column: IColumn<RowData>;
}

export class DataTableCell<RowData extends object> extends React.PureComponent<IDataTableCellProps<RowData>> {
	public render() {
		return (
			<td
				className={classnames(classes.cellClassName, this.props.cellClassName)}
			>
				{parseDatum(this.props.datum, this.props.column, this.props.isAggregated)}
			</td>
		);
	}
}

export interface IDataTableCategoryRowProps extends Partial<Pick<typeof classes, "categoryRowClassName" | "cellClassName" | "rowClassName">> {
	colSpan: number;
	category: string;
	children?: SingleOrArray<React.ReactElement<any>>;

	onSelect?(): void;
	selected?: boolean;
	selectable?: boolean;
}

export type SingleOrArray<T> = T | T[];

function singleOrArrayToArray<T>(t: SingleOrArray<T>): T[] {
	if (t instanceof Array) {
		return t;
	} else {
		return [t];
	}
}

export class DataTableCategoryRow extends React.PureComponent<IDataTableCategoryRowProps, {}> {
	public render() {
		const children: SingleOrArray<React.ReactElement<any>> | undefined = this.props.children;
		const arrChildren = isSome(children) ? singleOrArrayToArray(children) : children;

		return [
			(
				<tr
					key={this.props.category}
					className={classnames(
						this.props.rowClassName, classes.rowClassName,
						this.props.categoryRowClassName, classes.categoryRowClassName,
					)}
				>
					{
						this.props.selectable && this.props.onSelect ? (
							<DataTableCategorySelectionCell
								rowSpan={arrChildren && arrChildren.length !== 0 ? arrChildren.length + 1 : undefined}
								category={this.props.category}
								onSelect={this.props.onSelect}
								selected={!!this.props.selected}
								cellClassName={this.props.cellClassName}
							/>
						) : null
					}
					<td
						colSpan={this.props.colSpan}
						className={classnames(this.props.cellClassName, classes.cellClassName)}
					>
						{this.props.category}
					</td>
				</tr>
			),
			...(arrChildren || []),
		];
	}
}

export interface IDataTableBodySelectionCellProps
	extends Pick<IDataTableRowProps, "cellClassName"> {
	id: string;
	selected: boolean;
	onSelect(id: string): void;
}

export class DataTableBodySelectionCell extends React.PureComponent<IDataTableBodySelectionCellProps> {
	private onSelect = () => {
		this.props.onSelect(this.props.id);
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

export interface IDataTableCategorySelectionCellProps
	extends Pick<IDataTableRowProps, "cellClassName"> {
	selected: boolean;
	onSelect(): void;
	category: string;
	rowSpan?: number;
}

export class DataTableCategorySelectionCell extends React.PureComponent<IDataTableCategorySelectionCellProps> {
	public render() {
		return (
			<SelectionCell
				rowSpan={this.props.rowSpan}
				onChange={this.props.onSelect}
				selected={!!this.props.selected}
				className={classnames(this.props.cellClassName, classes.cellClassName)}
			/>
		);
	}
}
