import { dateSorter, numberSorter, stringSorter } from "../utils/sorters";
import { IColumn, IDataTableCategoryProps, IDataTableCoreProps, IDataTableProps, IDataTableSortProps } from "..";
import { IEmployee, employeeData, testClasses } from "./data";

export interface IPropsOptions {
	// core features
	emptyData?: boolean;
	disableIdAccessor?: boolean;

	// category features
	categories?: boolean;
	categoryLabel?: boolean;

	// sorting features
	sortable?: boolean;
	defaultSort?: boolean;
}

function generateColumnsWithFeatures(options: IPropsOptions): Array<IColumn<IEmployee>> {
	return [
		{
			id: "nome",
			label: "Nome",
			accessor: (row) => row.name,
			sortFunction: options.sortable ? stringSorter : undefined,
		},
		{
			id: "idade",
			label: "Idade",
			accessor: (row) => row.age,
			sortFunction: options.sortable ? numberSorter : undefined,
		},
		{
			id: "birthday",
			label: "Nascimento",
			accessor: (row) => row.birthday,
			renderCell: (d: Date) => d.toDateString(),
			sortFunction: options.sortable ? dateSorter : undefined,
		},
		{
			id: "balance",
			label: "Saldo",
			accessor: (row) => row.balance,
			sortFunction: options.sortable ? numberSorter : undefined,
			renderCell: (n: number) => n.toLocaleString("pt-br", { style: "currency", currency: "BRL" }),
		},
	];
}

export function generatePropsWithFeatures(options: IPropsOptions): IDataTableProps<IEmployee> {
	const coreProps: IDataTableCoreProps<IEmployee> = {
		data: options.emptyData ? [] : employeeData,
		columns: generateColumnsWithFeatures(options),
		idAccessor: options.disableIdAccessor ? undefined : (emp) => emp.id,
		...testClasses,
	};

	const categoryProps: IDataTableCategoryProps<IEmployee> = {
		categoryAccessor: (employee) => employee.role,
		categoryLabel: options.categoryLabel ? "Cargo" : undefined,
	};

	const sortProps: IDataTableSortProps = {
		defaultSort: options.defaultSort ? "nome" : undefined,
	};

	return {
		...coreProps,
		...(options.sortable ? sortProps : {}),
		...(options.categories ? categoryProps : {}),
	};
}
