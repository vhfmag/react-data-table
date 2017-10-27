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
		};

		const columns: ReadonlyArray<ILeveledColumn<T>> | undefined = newCol.columns && getLeveledColumns(newCol.columns, parent);

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

export function getColumnsOfLevel<T extends object>(cols: ReadonlyArray<ILeveledColumn<T>>, level: number): ReadonlyArray<ILeveledColumn<T>> {
	if (level === 0) {
		return cols;
	} else if (level > 0) {
		const nextLevel = cols.map((col) => col.columns || []).reduce((acc, arr) => [...acc, ...arr]);

		return getColumnsOfLevel(nextLevel, level - 1);
	} else {
		throw new TypeError(`Invalid call to getColumnsLevel - level is negative: ${level}`);
	}
}

export function flattenColumns<T extends object = object>(cols: ReadonlyArray<IColumn<T>>, parentColumn?: IColumn<T>): ReadonlyArray<IColumn<T>> {
	return cols.map((col) => {
		const parentAccessor: IColumn<T>["accessor"] = parentColumn ? parentColumn.accessor : (v) => v;
		const newCol: typeof col = {...col, accessor: (v) => col.accessor(parentAccessor(v))};
		if (col.columns) {
			return [newCol, ...flattenColumns(col.columns, newCol)];
		} else {
			return [newCol];
		}
	}).reduce((acc, arr) => [...acc, ...arr]);
}

export function flattenColumnsWithContent<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): ReadonlyArray<IColumn<T>> {
	return flattenColumns(cols).filter((col) => !col.columns);
}
