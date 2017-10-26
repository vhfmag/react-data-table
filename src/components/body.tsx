import { getColSpan } from "../utils/helpers";
import * as React from "react";
import * as classnames from "classnames";
import DataTableRow, { DataTableRuleRow } from "./row";
import { IDataTableProps } from "..";
import { tableBodyClassName } from "../utils/classes";
import { ObjectOmit } from "typelevel-ts";
import groupBy = require("lodash/groupBy");
import { createSelector } from "reselect";

export interface IDataTableBodyProps<RowData extends object>
	extends Pick<
		IDataTableProps<RowData>,
		"columns" | "tableBodyClassName" | "cellClassName" | "rowClassName" | "idAccessor" | "categoryAccessor" | "categoryLabel" | "data"
	> {
}

const mapDatumToComponent = <RowData extends object = object>(props: IDataTableBodyProps<RowData>) => (rowData: RowData, i: number) => {
	return (
		<DataTableRow
			datum={rowData}
			columns={props.columns}
			rowClassName={props.rowClassName}
			cellClassName={props.cellClassName}
			key={props.idAccessor ? props.idAccessor(rowData) : i}
		/>
	);
};

export interface IDataTableCategorySectionProps<RowData extends object>
	extends ObjectOmit<IDataTableBodyProps<RowData>, "categoryAccessor"> {
	category: string;
}

export class DataTableCategorySection<RowData extends object> extends React.PureComponent<IDataTableCategorySectionProps<RowData>> {
	public render() {
		return [
			(
				<DataTableRuleRow
					key="rule"
					content={this.props.category}
					label={this.props.categoryLabel}
					colSpan={getColSpan(this.props.columns)}
					cellClassName={this.props.cellClassName}
				/>
			),
			...this.props.data.map(mapDatumToComponent(this.props)),
		];
	}
}

export default class DataTableBody<RowData extends object = object> extends React.PureComponent<IDataTableBodyProps<RowData>, {}> {
	protected groupRowsByCategory = createSelector(
		(props: IDataTableBodyProps<RowData>) => props.data,
		(props: IDataTableBodyProps<RowData>) => props.categoryAccessor,
		(data: RowData[], categoryAccesor: IDataTableBodyProps<RowData>["categoryAccessor"]) => groupBy<RowData>(data, categoryAccesor),
	);

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
								data={rowsDictionary[category]}
							/>
						))
					) : this.props.data.map(mapDatumToComponent(this.props))
				}
			</tbody>
		);
	}
}
