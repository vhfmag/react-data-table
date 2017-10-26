import { getColumnsColSpan, getColumnsMaxRowSpan } from "../utils/helpers";
import {
	activeSortArrowClassName,
	ascendantSortArrowClassName,
	descendantSortArrowClassName,
	sortArrowClassName,
} from "../utils/privateClassNames";
import { headerCellClassName, rowClassName, tableHeaderClassName } from "../utils/publicClassNames";
import * as React from "react";
import { IColumn, IDataTableProps } from "..";
import * as classnames from "classnames";

export interface IDataTableHeaderProps<RowData extends object>
	extends Pick<IDataTableProps<RowData>, "columns" | "headerCellClassName" | "tableHeaderClassName" | "rowClassName"> {
	currentlySortedColumn: string | undefined;
	isSortingDescendant: boolean;

	onChangeSorting(column: string, descendant: boolean): void;
}

export interface ISortArrowProps {
	active: boolean;
	columnId: string;
	descendant: boolean;
	onChangeSorting: IDataTableHeaderProps<any>["onChangeSorting"];
}

export class SortArrow extends React.PureComponent<ISortArrowProps> {
	private onClick = () => {
		if (!this.props.active) {
			this.props.onChangeSorting(this.props.columnId, false);
		} else {
			this.props.onChangeSorting(this.props.columnId, !this.props.descendant);
		}
	}

	public render() {
		return (
			<div
				role="button"
				onClick={this.onClick}
				className={
					classnames(
						sortArrowClassName,
						this.props.active && activeSortArrowClassName,
						this.props.active && (
							this.props.descendant ?
								descendantSortArrowClassName
							:	ascendantSortArrowClassName
						),
					)
				}
			/>
		);
	}
}

export interface IDataTableHeaderCellProps<RowData extends object, CellData>
	extends Pick<IDataTableHeaderProps<RowData>, "isSortingDescendant" | "headerCellClassName" | "onChangeSorting"> {
	column: IColumn<RowData, CellData>;
	isCurrentlySorted: boolean;

	rowSpan?: number;
	colSpan?: number;
}

export class DataTableHeaderCell<RowData extends object, CellData> extends React.Component<IDataTableHeaderCellProps<RowData, CellData>> {
	public render() {
		return (
			<th
				key={this.props.column.id}
				rowSpan={this.props.rowSpan || 1}
				colSpan={this.props.colSpan || 1}
				className={classnames(headerCellClassName, this.props.headerCellClassName)}
			>
				{this.props.column.label}

				{
					this.props.column.sortFunction ? (
						<SortArrow
							columnId={this.props.column.id}
							active={this.props.isCurrentlySorted}
							onChangeSorting={this.props.onChangeSorting}
							descendant={this.props.isCurrentlySorted && this.props.isSortingDescendant}
						/>
					) : null
				}
			</th>
		);
	}
}

export default class DataTableHeader<RowData extends object = object> extends React.PureComponent<IDataTableHeaderProps<RowData>, {}> {
	private static getColumnsLevel<T extends object>(cols: ReadonlyArray<IColumn<T>>, level: number): ReadonlyArray<IColumn<T>> {
		if (level === 0) {
			return cols;
		} else if (level > 0) {
			const nextLevel = cols.map((col) => col.columns!).filter((arr) => arr).reduce((acc, arr) => [...acc, ...arr]);

			return DataTableHeader.getColumnsLevel(nextLevel, level - 1);
		} else {
			throw new TypeError(`Invalid call to getColumnsLevel - level is negative: ${level}`);
		}
	}

	public render() {
		const rowSpan = getColumnsMaxRowSpan(this.props.columns);
		const levels = [...new Array(rowSpan)].map((_, i) => DataTableHeader.getColumnsLevel(this.props.columns, i));
		const rowSpans = levels.map(getColumnsMaxRowSpan);

		return (
			<thead className={classnames(tableHeaderClassName, this.props.tableHeaderClassName)}>
				{
					levels.map((rowColumns, level) => (
						<tr key={level} className={classnames(rowClassName, this.props.rowClassName)}>
							{
								rowColumns.map((column) => (
									<DataTableHeaderCell
										key={column.id}
										column={column}
										onChangeSorting={this.props.onChangeSorting}
										isSortingDescendant={this.props.isSortingDescendant}
										headerCellClassName={this.props.headerCellClassName}
										isCurrentlySorted={this.props.currentlySortedColumn === column.id}

										colSpan={column.columns && getColumnsColSpan(column.columns)}
										rowSpan={column.columns ? (rowSpans[level] - getColumnsMaxRowSpan(column.columns)) : rowSpans[level]}
									/>
								))
							}
						</tr>
					))
				}
			</thead>
		);
	}
}
