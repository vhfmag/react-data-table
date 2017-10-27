import { flattenColumnsWithContent } from "./utils/helpers/columns";
import { Comparator } from "./utils/sorters";
import * as React from "react";
import classnames from "classnames";

import DataTableBody from "./components/body";
import * as classes from "./utils/publicClassNames";
import DataTableHeader from "./components/header";
import { tableClassName } from "./utils/publicClassNames";

import { decorate } from "core-decorators";
import { createSelector } from "reselect";

import moize from "moize";

export interface IColumn<RowData, CellData = any> {
	id: string;
	label: string | null;
	accessor(v: RowData): CellData;
	renderCell?(v: CellData): React.ReactNode;
	sortFunction?: Comparator<CellData>;

	columns?: ReadonlyArray<IColumn<CellData>>;
}

export interface IDataTableCoreProps<RowData extends object> extends Partial<typeof classes> {
	data: ReadonlyArray<RowData>;
	columns: ReadonlyArray<IColumn<RowData>>;

	idAccessor?(datum: RowData): string | number;

	children?: never;
}

export interface IDataTableCategoryProps<RowData extends object> {
	categoryAccessor(row: RowData): string;
	categoryLabel?: React.ReactNode;
}

export interface IDataTableSortProps {
	defaultSort?: string;
}

export interface IDataTableSelectProps {
	selected: string[];
	selectable?: boolean;
}

export interface IDataTableProps<RowData extends object>
	extends IDataTableCoreProps<RowData>,
			Partial<IDataTableCategoryProps<RowData>>,
			Partial<IDataTableSortProps>,
			Partial<IDataTableSelectProps> {
}

export interface IDataTableState {
	currentlySortedColumn?: string;
	isSortingDescendant: boolean;
}

export default class DataTable<RowData extends object> extends React.Component<IDataTableProps<RowData>, IDataTableState> {
	constructor(props: IDataTableProps<RowData>) {
		super(props);

		this.state = {
			isSortingDescendant: false,
			currentlySortedColumn: this.props.defaultSort,
		};
	}

	private getFlattenedColumns = createSelector(
		(props: IDataTableProps<RowData>) => props.columns,
		flattenColumnsWithContent,
	);

	@decorate(moize({ maxSize: 1 }))
	private getSortedData<CellData>(data: ReadonlyArray<RowData>, column: IColumn<RowData, CellData> | undefined, descendant: boolean) {
		if (!column || !column.sortFunction) {
			return data;
		} else {
			const accessor = column.accessor;
			const sorter = column.sortFunction;

			return [...data].sort((t1, t2) => (descendant ? -1 : 1) * sorter(accessor(t1), accessor(t2)));
		}
	}

	private onChangeSorting = (currentlySortedColumn: string, isSortingDescendant: boolean): void => {
		this.setState({ currentlySortedColumn, isSortingDescendant });
	}

	public render() {
		const flattenedColumns = this.getFlattenedColumns(this.props);

		const sortedData = this.getSortedData(
			this.props.data,
			flattenedColumns.find((col) => col.id === this.state.currentlySortedColumn),
			this.state.isSortingDescendant,
		);

		return (
			<table
				className={classnames(tableClassName, this.props.tableClassName)}
			>
				<DataTableHeader
					columns={this.props.columns}
					rowClassName={this.props.rowClassName}
					headerCellClassName={this.props.headerCellClassName}
					tableHeaderClassName={this.props.tableHeaderClassName}

					onChangeSorting={this.onChangeSorting}
					isSortingDescendant={this.state.isSortingDescendant}
					currentlySortedColumn={this.state.currentlySortedColumn}
				/>

				<DataTableBody
					data={sortedData}
					columns={flattenedColumns}
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
