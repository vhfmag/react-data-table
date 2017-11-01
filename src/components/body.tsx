import { getColumnsColSpan } from "../utils/helpers/columns";
import * as React from "react";
import classnames from "classnames";
import DataTableRow, { DataTableCategoryRow, IDataTableRowProps } from "./row";
import { IDataTableProps, INullableObject } from "..";
import { tableBodyClassName } from "../utils/publicClassNames";
import { ObjectOmit } from "typelevel-ts";
import groupBy from "lodash/groupBy";
import { createSelector } from "reselect";

const totalDatumToComponent = <RowData extends object>(props: IDataTableBodyProps<RowData>, id: string, isCategory?: boolean) => (totalData: INullableObject<RowData>) => {
	const fakeProps: IDataTableBodyProps<INullableObject<RowData>> = { ...props, idAccessor: () => id };

	return mapDatumToComponent(fakeProps, undefined, true, isCategory)(totalData);
};

const mapDatumToComponent = <RowData extends object>(props: IDataTableBodyProps<RowData>, onSelect?: IDataTableRowProps<RowData>["onSelect"], isAggregated?: boolean, isCategory?: boolean) => (rowData: RowData) => {
	return (
		<DataTableRow
			datum={rowData}
			columns={props.columns}
			id={props.idAccessor(rowData)}
			key={props.idAccessor(rowData)}

			onSelect={onSelect}
			selectable={props.selectable}
			selected={(props.selectedRowsIds || []).includes(props.idAccessor(rowData))}

			isCategory={isCategory}
			isAggregated={isAggregated}

			rowClassName={props.rowClassName}
			cellClassName={props.cellClassName}
			totalRowClassName={props.totalRowClassName}
			categoryRowClassName={props.categoryRowClassName}
		/>
	);
};

export interface IDataTableCategorySectionProps<RowData extends object>
	extends ObjectOmit<IDataTableBodyProps<RowData>, "onSelect" | "hideBodyTotal"> {
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

	private computeTotalData = createSelector(
		(props: IDataTableCategorySectionProps<RowData>) => props.data,
		(props: IDataTableCategorySectionProps<RowData>) => props.category,
		(props: IDataTableCategorySectionProps<RowData>) => props.totalAccessor,
		(data, category, totalAccessor) => {
			if (totalAccessor) {
				return totalAccessor(data, category);
			}

			throw new Error("Invalid call to computeTotalData");
		},
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
					colSpan={getColumnsColSpan(this.props.columns)}

					rowClassName={this.props.rowClassName}
					cellClassName={this.props.cellClassName}
					categoryRowClassName={this.props.categoryRowClassName}

					onSelect={this.onSelectCategory}
					selectable={this.props.selectable}
					selected={this.areAllCategoryRowsSelected(this.props)}
				>
					{
						this.props.totalAccessor && !this.props.hideCategoryTotal ? (
							totalDatumToComponent(this.props, this.props.category, true)(this.computeTotalData(this.props))
						) : undefined
					}
				</DataTableCategoryRow>
			),
			...this.props.data.map(mapDatumToComponent(this.props, this.onSelectRow)),
		];
	}
}

export interface IDataTableBodyProps<RowData extends object>
	extends Pick<
		IDataTableProps<RowData>,
		"columns" | "tableBodyClassName" | "cellClassName" | "rowClassName" | "idAccessor" | "categoryAccessor" | "data" | "selectable" | "selectedRowsIds" | "onSelect" | "totalAccessor" | "hideBodyTotal" | "hideCategoryTotal" | "totalRowClassName" | "selectedRowClassName" | "categoryRowClassName"
	> {
}

export default class DataTableBody<RowData extends object = object> extends React.PureComponent<IDataTableBodyProps<RowData>, {}> {
	private groupRowsByCategory = createSelector(
		(props: IDataTableBodyProps<RowData>) => props.data,
		(props: IDataTableBodyProps<RowData>) => props.categoryAccessor,
		groupBy,
	);

	private computeTotalData = createSelector(
		(props: IDataTableBodyProps<RowData>) => props.data,
		(props: IDataTableBodyProps<RowData>) => props.totalAccessor,
		(data, totalAccessor) => {
			if (totalAccessor) {
				return totalAccessor(data);
			}

			throw new Error("Invalid call to computeTotalData");
		},
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
					this.props.totalAccessor && !this.props.hideBodyTotal ? (
						totalDatumToComponent(this.props, "$total")(this.computeTotalData(this.props))
					) : null
				}

				{
					rowsDictionary ? (
						Object.keys(rowsDictionary).map((category) => (
							<DataTableCategorySection
								{...this.props}
								key={category}
								category={category}
								onSelectRows={this.onSelect}
								data={rowsDictionary[category]}
								categoryRowClassName={this.props.categoryRowClassName}
							/>
						))
					) : this.props.data.map(mapDatumToComponent(this.props, this.onSelectRow))
				}
			</tbody>
		);
	}
}
