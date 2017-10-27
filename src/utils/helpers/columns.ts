import { IColumn } from "../..";
import { ObjectOmit } from "typelevel-ts";

export interface IChildColumnChildren<T extends object> {
	columns?: ReadonlyArray<IChildColumn<T>>;
}

export interface ILeveledColumnChildren<T extends object> {
	columns?: ReadonlyArray<ILeveledColumn<T>>;
}

export interface IChildColumn<T extends object> extends ObjectOmit<IColumn<T>, "columns">, IChildColumnChildren<T> {
	parent?: IChildColumn<T>;
}

export interface ILeveledColumn<T extends object> extends ObjectOmit<IChildColumn<T>, "columns">, ILeveledColumnChildren<T> {
	rowSpan: number;
	parent?: ILeveledColumn<T>;
}

export function linkColumnsToParent<T extends object>(cols: ReadonlyArray<IColumn<T>>, parent?: IChildColumn<T>): ReadonlyArray<IChildColumn<T>> {
	return cols.map((col) => {
		const newCol: IChildColumn<T> = { ...col, parent };
		if (newCol.columns) {
			newCol.columns = linkColumnsToParent(newCol.columns, newCol);
		}

		return newCol;
	});
}

export function getLeveledColumns<T extends object>(cols: ReadonlyArray<IChildColumn<T>>, parent?: ILeveledColumn<T>): ReadonlyArray<ILeveledColumn<T>> {
	const levelRowSpan = getColumnsMaxRowSpan(cols);

	return cols.map<ILeveledColumn<T>>((col) => {
		const newCol = {
			...col,
			parent,
			rowSpan: levelRowSpan - (col.columns ? getColumnsMaxRowSpan(col.columns) : 0),
		} as ILeveledColumn<T>;

		const columns: ReadonlyArray<ILeveledColumn<T>> | undefined = newCol.columns && getLeveledColumns(newCol.columns, newCol);

		return { ...newCol, columns };
	});
}

export function getColumnsColSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): number {
	return cols.map((col) => col.columns ? getColumnsColSpan(col.columns) : 1).reduce((acc, span) => acc + span, 0);
}

export function getColumnsMaxRowSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): number {
	return Math.max(...cols.map(
		(col) => col.columns && col.columns.length > 0 ? 1 + getColumnsMaxRowSpan(col.columns) : 1),
	);
}

export interface IColumnsByLevel<T extends object> {
	[index: number]: ReadonlyArray<ILeveledColumn<T>>;
}

export function getColumnsByLevel<T extends object>(cols: ReadonlyArray<ILeveledColumn<T>>): IColumnsByLevel<T> {
	const flatCols = flattenColumns(cols);
	const ret: IColumnsByLevel<T> = {};

	for (const col of flatCols) {
		let level: number = 0;
		if (col.parent) {
			let parent: typeof col.parent | undefined = col.parent;

			while (parent) {
				level += parent.rowSpan;
				parent = parent.parent;
			}
		}

		ret[level] = [...(ret[level] || []), col];
	}

	return ret;
}

export interface IGenericColumn<RowData, CellData = any> {
	accessor(v: RowData): CellData;
	columns?: ReadonlyArray<IGenericColumn<CellData, any>>;
}

export function flattenColumns<T extends object, Col extends IGenericColumn<T>>(cols: ReadonlyArray<Col>, parentColumn?: Col): ReadonlyArray<Col> {
	return cols.map((col) => {
		const parentAccessor: Col["accessor"] = parentColumn ? parentColumn.accessor : (v) => v;
		const newCol: typeof col = {...(col as any), accessor: (v) => col.accessor(parentAccessor(v))};
		if (col.columns) {
			return [newCol, ...flattenColumns<T, Col>(col.columns as Col[], newCol)];
		} else {
			return [newCol];
		}
	}).reduce((acc, arr) => [...acc, ...arr]);
}

export function flattenColumnsWithContent<T extends object, Col extends IGenericColumn<T>>(cols: ReadonlyArray<Col>): ReadonlyArray<Col> {
	return flattenColumns<T, Col>(cols).filter((col) => !col.columns);
}
