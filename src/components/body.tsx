import { getColumnsColSpan } from "../utils/helpers/columns";
import * as React from "react";
import classnames from "classnames";
import DataTableRow, { DataTableRuleRow, IDataTableRowProps } from "./row";
import { IDataTableProps } from "..";
import { tableBodyClassName } from "../utils/publicClassNames";
import { ObjectOmit } from "typelevel-ts";
import groupBy from "lodash/groupBy";
import { createSelector } from "reselect";

export interface IDataTableBodyProps<RowData extends object>
	extends Pick<
		IDataTableProps<RowData>,
		"columns" | "tableBodyClassName" | "cellClassName" | "rowClassName" | "idAccessor" | "categoryAccessor" | "categoryLabel" | "data" | "selectable" | "selectedRowsIds" | "onSelect"
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
	extends ObjectOmit<IDataTableBodyProps<RowData>, "categoryAccessor"> {
	category: string;
	onSelectRow?: IDataTableRowProps<RowData>["onSelect"];
}

export class DataTableCategorySection<RowData extends object> extends React.PureComponent<IDataTableCategorySectionProps<RowData>> {
	public render() {
		return [
			(
				<DataTableRuleRow
					key="rule"
					content={this.props.category}
					label={this.props.categoryLabel}
					colSpan={getColumnsColSpan(this.props.columns) + (this.props.selectable && this.props.onSelect ? 1 : 0)}
					cellClassName={this.props.cellClassName}
				/>
			),
			...this.props.data.map(mapDatumToComponent(this.props, this.props.onSelectRow)),
		];
	}
}

export default class DataTableBody<RowData extends object = object> extends React.PureComponent<IDataTableBodyProps<RowData>, {}> {
	protected groupRowsByCategory = createSelector(
		(props: IDataTableBodyProps<RowData>) => props.data,
		(props: IDataTableBodyProps<RowData>) => props.categoryAccessor,
		groupBy,
	);

	private onSelect = (id: string) => {
		/* istanbul ignore if */
		if (!this.props.onSelect) {
			throw new Error("Invalid state: calling body's on select without a props' onSelect defined");
		}

		const oldSelected = this.props.selectedRowsIds || [];
		const newSelected = oldSelected.includes(id) ? oldSelected.filter((rowId) => rowId !== id) : [...oldSelected, id];

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
								onSelectRow={this.onSelect}
								data={rowsDictionary[category]}
							/>
						))
					) : this.props.data.map(mapDatumToComponent(this.props, this.onSelect))
				}
			</tbody>
		);
	}
}
