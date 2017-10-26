import { IColumn } from ".";

export function getColSpan<T extends object = object>(cols: ReadonlyArray<IColumn<T>>): number {
	return cols.length;
}
