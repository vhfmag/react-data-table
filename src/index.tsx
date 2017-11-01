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

export type INullableObject<T extends object> = {
	[key in keyof T]?: T[key] | null | undefined
};

export interface IColumn<RowData, CellData = any> {
	id: string;
	label: string | null;
	accessor(v: RowData): CellData | null | undefined;
	renderCell?(v: CellData | null | undefined): React.ReactNode;
	sortFunction?: Comparator<CellData>;

	columns?: ReadonlyArray<IColumn<CellData>>;

	renderAggregate?(val: CellData | null | undefined): React.ReactNode;
}

export interface IDataTableCoreProps<RowData extends object> extends Partial<typeof classes> {
	data: ReadonlyArray<RowData>;
	columns: ReadonlyArray<IColumn<RowData>>;

	idAccessor(datum: RowData): string;

	children?: never;
}

export interface IDataTableCategoryProps<RowData extends object> {
	categoryAccessor(row: RowData): string;
}

export interface IDataTableSortProps {
	defaultSort?: string;
}

export interface IDataTableTotalProps<RowData extends object> {
	totalAccessor(data: ReadonlyArray<RowData>, category?: string): INullableObject<RowData>;
	hideBodyTotal?: boolean;
	hideCategoryTotal?: boolean;
}

export interface IDataTableSelectProps {
	selectable?: boolean;
	selectedRowsIds?: string[];
	onSelect(selectedRowsIds: string[]): void;
}

export interface IDataTableProps<RowData extends object>
	extends IDataTableCoreProps<RowData>,
			Partial<IDataTableCategoryProps<RowData>>,
			Partial<IDataTableTotalProps<RowData>>,
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
			<table className={classnames(tableClassName, this.props.tableClassName)}>
				<DataTableHeader
					data={this.props.data}
					columns={this.props.columns}
					idAccessor={this.props.idAccessor}

					onChangeSorting={this.onChangeSorting}
					isSortingDescendant={this.state.isSortingDescendant}
					currentlySortedColumn={this.state.currentlySortedColumn}

					selectable={this.props.selectable}
					onSelect={this.props.onSelect}
					selectedRowsIds={this.props.selectedRowsIds}

					rowClassName={this.props.rowClassName}
					headerCellClassName={this.props.headerCellClassName}
					tableHeaderClassName={this.props.tableHeaderClassName}
				/>

				<DataTableBody
					data={sortedData}
					columns={flattenedColumns}
					idAccessor={this.props.idAccessor}

					categoryAccessor={this.props.categoryAccessor}

					onSelect={this.props.onSelect}
					selectable={this.props.selectable}
					selectedRowsIds={this.props.selectedRowsIds}

					totalAccessor={this.props.totalAccessor}
					hideBodyTotal={this.props.hideBodyTotal}
					hideCategoryTotal={this.props.hideCategoryTotal}

					rowClassName={this.props.rowClassName}
					cellClassName={this.props.cellClassName}
					tableBodyClassName={this.props.tableBodyClassName}
				/>
			</table>
		);
	}
}
