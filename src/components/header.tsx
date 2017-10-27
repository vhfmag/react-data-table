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
import classnames from "classnames";
import { ObjectOmit } from "typelevel-ts";

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

interface IChildColumnChildren<T extends object> {
	columns?: ReadonlyArray<IChildColumn<T>>;
}

interface ILeveledColumnChildren<T extends object> {
	columns?: ReadonlyArray<ILeveledColumn<T>>;
}

interface IChildColumn<T extends object> extends ObjectOmit<IColumn<T>, "columns">, IChildColumnChildren<T> {
	parent?: IChildColumn<T>;
}

interface ILeveledColumn<T extends object> extends ObjectOmit<IChildColumn<T>, "columns">, ILeveledColumnChildren<T> {
	rowSpan: number;
	parent?: ILeveledColumn<T>;
}

export default class DataTableHeader<RowData extends object = object> extends React.PureComponent<IDataTableHeaderProps<RowData>, {}> {
	private static linkColumnsToParent<T extends object>(cols: ReadonlyArray<IColumn<T>>, parent?: IChildColumn<T>): ReadonlyArray<IChildColumn<T>> {
		return cols.map((col) => {
			const newCol: IChildColumn<T> = { ...col, parent };
			if (newCol.columns) {
				newCol.columns = DataTableHeader.linkColumnsToParent(newCol.columns, newCol);
			}

			return newCol;
		});
	}

	private static getLeveledColumns<T extends object>(cols: ReadonlyArray<IChildColumn<T>>, parent?: ILeveledColumn<T>): ReadonlyArray<ILeveledColumn<T>> {
		const levelRowSpan = getColumnsMaxRowSpan(cols);

		return cols.map<ILeveledColumn<T>>((col) => {
			const newCol = {
				...col,
				parent,
				rowSpan: levelRowSpan - (col.columns ? getColumnsMaxRowSpan(col.columns) : 0),
			};

			const columns: ReadonlyArray<ILeveledColumn<T>> | undefined = newCol.columns && DataTableHeader.getLeveledColumns(newCol.columns, parent);

			return { ...newCol, columns };
		});
	}

	private static getColumnsOfLevel<T extends object>(cols: ReadonlyArray<ILeveledColumn<T>>, level: number): ReadonlyArray<ILeveledColumn<T>> {
		if (level === 0) {
			return cols;
		} else if (level > 0) {
			const nextLevel = cols.map((col) => col.columns || []).reduce((acc, arr) => [...acc, ...arr]);

			return DataTableHeader.getColumnsOfLevel(nextLevel, level - 1);
		} else {
			throw new TypeError(`Invalid call to getColumnsLevel - level is negative: ${level}`);
		}
	}

	public render() {
		const rowSpan = getColumnsMaxRowSpan(this.props.columns);
		const parented = DataTableHeader.linkColumnsToParent(this.props.columns);
		const leveled = DataTableHeader.getLeveledColumns(parented);
		const levels = [...new Array(rowSpan)].map((_, i) => DataTableHeader.getColumnsOfLevel(leveled, i));

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
										rowSpan={column.rowSpan}
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
