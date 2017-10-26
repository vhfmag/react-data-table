export type Maybe<T> = T | null | undefined;
export type Sorter<T> = (t1: Maybe<T>, t2: Maybe<T>) => number;
export type OptimisticSorter<T> = (t1: T, t2: T) => number;

function isSome<T>(t: Maybe<T>): t is T {
	return t !== undefined && t !== null;
}

function defaultNoneSorter<T>(t1: Maybe<T>, t2: Maybe<T>) {
	if (!isSome(t1) && !isSome(t2)) {
		return NaN;
	} else if (isSome(t1)) {
		return Infinity;
	} else if (isSome(t2)) {
		return -Infinity;
	} else {
		throw new TypeError("Improper call to defaultNoneSorter: one of the operands should be null or undefined");
	}
}

function sortWrapper<T>(sorter: OptimisticSorter<T>) {
	return (t1: Maybe<T>, t2: Maybe<T>) => {
		if (isSome(t1) && isSome(t2)) {
			return sorter(t1, t2);
		} else {
			return defaultNoneSorter(t1, t2);
		}
	};
}

export const numberSorter: Sorter<number> = sortWrapper((t1, t2) => t1 - t2);
export const stringSorter: Sorter<string> = sortWrapper((t1, t2) => t1.localeCompare(t2));
export const dateSorter: Sorter<Date> = sortWrapper((t1, t2) => t1.valueOf() - t2.valueOf());
