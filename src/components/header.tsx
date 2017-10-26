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
}

export class DataTableHeaderCell<RowData extends object, CellData> extends React.Component<IDataTableHeaderCellProps<RowData, CellData>> {
	public render() {
		return (
			<th
				key={this.props.column.id}
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
		return (
			<thead
				className={classnames(tableHeaderClassName, this.props.tableHeaderClassName)}
			>
				<tr
					className={classnames(rowClassName, this.props.rowClassName)}
				>
					{
						this.props.columns.map((column) => (
							<DataTableHeaderCell
								key={column.id}
								column={column}
								onChangeSorting={this.props.onChangeSorting}
								isSortingDescendant={this.props.isSortingDescendant}
								headerCellClassName={this.props.headerCellClassName}
								isCurrentlySorted={this.props.currentlySortedColumn === column.id}
							/>
						))
					}
				</tr>
			</thead>
		);
	}
}
