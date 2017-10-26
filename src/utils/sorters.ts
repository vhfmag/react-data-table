export type Maybe<T> = T | null | undefined;
export type Comparator<T> = (t1: Maybe<T>, t2: Maybe<T>) => number;
export type OptimisticComparator<T> = (t1: T, t2: T) => number;

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

function sortWrapper<T>(sorter: OptimisticComparator<T>) {
	return (t1: Maybe<T>, t2: Maybe<T>) => {
		if (isSome(t1) && isSome(t2)) {
			return sorter(t1, t2);
		} else {
			return defaultNoneSorter(t1, t2);
		}
	};
}

export const numberSorter: Comparator<number> = sortWrapper((t1, t2) => t1 - t2);
export const stringSorter: Comparator<string> = sortWrapper((t1, t2) => t1.localeCompare(t2));
export const dateSorter: Comparator<Date> = sortWrapper((t1, t2) => t1.valueOf() - t2.valueOf());
