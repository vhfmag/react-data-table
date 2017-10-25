import { IColumn } from ".";

export function getColSpan<T extends object = object>(cols: Array<IColumn<T>>): number {
	return cols.length;
}
