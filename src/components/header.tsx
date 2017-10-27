import {
	getColumnsColSpan,
	linkColumnsToParent,
	getLeveledColumns,
	getColumnsByLevel,
} from "../utils/helpers/columns";

import {
	activeSortArrowClassName,
	ascendantSortArrowClassName,
	descendantSortArrowClassName,
	sortArrowClassName,
} from "../utils/privateClassNames";
import { headerCellClassName, rowClassName, tableHeaderClassName } from "../utils/publicClassNames";
import * as React from "react";
import { IColumn, IDataTableProps } from "..";
import classnames from "classnames";

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

	rowSpan: number;
	colSpan: number | undefined;
}

export class DataTableHeaderCell<RowData extends object, CellData> extends React.Component<IDataTableHeaderCellProps<RowData, CellData>> {
	public render() {
		return (
			<th
				key={this.props.column.id}
				rowSpan={this.props.rowSpan}
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
	public render() {
		// const rowSpan = getColumnsMaxRowSpan(this.props.columns);
		const parented = linkColumnsToParent(this.props.columns);
		const leveled = getLeveledColumns(parented);
		const colsByLevel = getColumnsByLevel(leveled);

		const rows: Array<React.ReactElement<any>> = [];
		for (const level in colsByLevel) {
			const rowColumns = colsByLevel[level];

			rows.push(
				<tr key={level} className={classnames(rowClassName, this.props.rowClassName)}>
					{
						(rowColumns || []).map((column) => (
							<DataTableHeaderCell
								key={column.id}
								column={column}
								onChangeSorting={this.props.onChangeSorting}
								isSortingDescendant={this.props.isSortingDescendant}
								headerCellClassName={this.props.headerCellClassName}
								isCurrentlySorted={this.props.currentlySortedColumn === column.id}

								colSpan={column.columns && getColumnsColSpan(column.columns)}
								rowSpan={column.rowSpan}
							/>
						))
					}
				</tr>,
			);
		}

		return (
			<thead className={classnames(tableHeaderClassName, this.props.tableHeaderClassName)}>
				{rows}
			</thead>
		);
	}
}
