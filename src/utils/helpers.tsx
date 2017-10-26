import { IColumn } from "..";

export function getColumnsColSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): number {
	return cols.map((col) => col.columns ? getColumnsColSpan(col.columns) : 1).reduce((acc, span) => acc + span, 0);
}

export function getColumnsMaxRowSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): number {
	return Math.max(...cols.map(
		(col) => col.columns && col.columns.length > 0 ? 1 + getColumnsMaxRowSpan(col.columns) : 1),
	);
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
