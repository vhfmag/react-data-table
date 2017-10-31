import { getColumnsColSpan } from "../utils/helpers/columns";
import * as React from "react";
import classnames from "classnames";
import DataTableRow, { DataTableCategoryRow, IDataTableRowProps } from "./row";
import { IDataTableProps } from "..";
import { tableBodyClassName } from "../utils/publicClassNames";
import { ObjectOmit } from "typelevel-ts";
import groupBy from "lodash/groupBy";
import { createSelector } from "reselect";

export interface IDataTableBodyProps<RowData extends object>
	extends Pick<
		IDataTableProps<RowData>,
		"columns" | "tableBodyClassName" | "cellClassName" | "rowClassName" | "idAccessor" | "categoryAccessor" | "data" | "selectable" | "selectedRowsIds" | "onSelect"
	> {
}

const mapDatumToComponent = <RowData extends object = object>(props: IDataTableBodyProps<RowData>, onSelect?: IDataTableRowProps<RowData>["onSelect"]) => (rowData: RowData) => {
	return (
		<DataTableRow
			datum={rowData}
			columns={props.columns}
			id={props.idAccessor(rowData)}
			key={props.idAccessor(rowData)}
			rowClassName={props.rowClassName}
			cellClassName={props.cellClassName}

			onSelect={onSelect}
			selectable={props.selectable}
			selected={(props.selectedRowsIds || []).includes(props.idAccessor(rowData))}
		/>
	);
};

export interface IDataTableCategorySectionProps<RowData extends object>
	extends ObjectOmit<IDataTableBodyProps<RowData>, "onSelect"> {
	category: string;
	onSelectRows(selected: boolean, ...ids: string[]): void;
}

export class DataTableCategorySection<RowData extends object> extends React.PureComponent<IDataTableCategorySectionProps<RowData>> {
	private areAllCategoryRowsSelected = createSelector(
		(props: IDataTableCategorySectionProps<RowData>) => props.data,
		(props: IDataTableCategorySectionProps<RowData>) => props.idAccessor,
		(props: IDataTableCategorySectionProps<RowData>) => props.selectedRowsIds,
		(data, idAccessor, selectedRowsIds) => selectedRowsIds && data.every((row) => selectedRowsIds.includes(idAccessor(row))) || false,
	);

	private onSelectCategory = () => {
		const areAllRowsSelected = this.areAllCategoryRowsSelected(this.props);
		this.props.onSelectRows(!areAllRowsSelected, ...this.props.data.map((row) => this.props.idAccessor(row)));
	}

	private onSelectRow = (row: string) => {
		this.props.onSelectRows(!(this.props.selectedRowsIds || []).includes(row), row);
	}

	public render() {
		return [
			(
				<DataTableCategoryRow
					key="rule"
					category={this.props.category}
					colSpan={getColumnsColSpan(this.props.columns) + (this.props.selectable ? 1 : 0)}

					cellClassName={this.props.cellClassName}

					onSelect={this.onSelectCategory}
					selectable={this.props.selectable}
					selected={this.areAllCategoryRowsSelected(this.props)}
				/>
			),
			...this.props.data.map(mapDatumToComponent(this.props, this.onSelectRow)),
		];
	}
}

export default class DataTableBody<RowData extends object = object> extends React.PureComponent<IDataTableBodyProps<RowData>, {}> {
	protected groupRowsByCategory = createSelector(
		(props: IDataTableBodyProps<RowData>) => props.data,
		(props: IDataTableBodyProps<RowData>) => props.categoryAccessor,
		groupBy,
	);

	private onSelectRow = (id: string) => {
		this.onSelect(!(this.props.selectedRowsIds || []).includes(id), id);
	}

	private onSelect = (selected: boolean, ...ids: string[]) => {
		/* istanbul ignore if */
		if (!this.props.onSelect) {
			throw new Error("Invalid state: calling body's on select without a props' onSelect defined");
		}

		const oldSelected = this.props.selectedRowsIds || [];
		const newSelected = selected ? [...new Set([...oldSelected, ...ids])] : oldSelected.filter((rowId) => !ids.includes(rowId));

		this.props.onSelect(newSelected);
	}

	public render() {
		const rowsDictionary = this.props.categoryAccessor ? this.groupRowsByCategory(this.props) : null;

		return (
			<tbody
				className={classnames(tableBodyClassName, this.props.tableBodyClassName)}
			>
				{
					rowsDictionary ? (
						Object.keys(rowsDictionary).map((category) => (
							<DataTableCategorySection
								{...this.props}
								key={category}
								category={category}
								onSelectRows={this.onSelect}
								data={rowsDictionary[category]}
							/>
						))
					) : this.props.data.map(mapDatumToComponent(this.props, this.onSelectRow))
				}
			</tbody>
		);
	}
}
