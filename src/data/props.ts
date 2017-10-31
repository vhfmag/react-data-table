import { dateSorter, numberSorter, stringSorter } from "../utils/sorters";
import {
	IColumn,
	IDataTableCategoryProps,
	IDataTableCoreProps,
	IDataTableProps,
	IDataTableSelectProps,
	IDataTableSortProps,
} from "..";
import { employeeData, IBalance, IEmployee, testClasses } from "./data";

export interface IPropsOptions {
	// core features
	emptyData?: boolean;

	// category features
	categories?: boolean;
	categoryLabel?: boolean;

	// sorting features
	sortable?: boolean;
	defaultSort?: boolean;

	// nested columns
	nestedColumns?: boolean;

	// row selection
	selectable?: boolean;
	undefinedSelected?: boolean;
}

const partialOptions: IPropsOptions[] = [
	{ emptyData: true },
	{ nestedColumns: true },
	{ sortable: true },
	{ defaultSort: true },
	{ categories: true },
	{ categoryLabel: true },
	{ selectable: true },
	{ undefinedSelected: true },
];

const optionsDescriptions: { [key in keyof IPropsOptions]: string } = {
	emptyData: "empty state",
	categories: "categories features",
	categoryLabel: "category label",
	sortable: "sorting feature",
	defaultSort: "default sort",
	nestedColumns: "nested columns",
	selectable: "selectable",
	undefinedSelected: "undefined selectedRowsIds prop",
};

function generateBalanceColumns(options: IPropsOptions, idPrefix: string): ReadonlyArray<IColumn<IBalance>> {
	return [
		{
			label: "A pagar",
			id: `${idPrefix}.toPay`,
			accessor: (balance) => balance.toPay,
			sortFunction: options.sortable ? numberSorter : undefined,
		},
		{
			label: "A receber",
			id: `${idPrefix}.toReceive`,
			accessor: (balance) => balance.toReceive,
			sortFunction: options.sortable ? numberSorter : undefined,
		},
	];
}

function generateColumnsWithFeatures(options: IPropsOptions): ReadonlyArray<IColumn<IEmployee>> {
	return [
		...(
			options.nestedColumns ? [
				{
					id: "nomecompleto",
					label: "Nome completo",
					accessor: (row: IEmployee) => row,
					columns: [
						{
							id: "nome",
							label: "Nome",
							accessor: (row: IEmployee) => row.firstName,
							sortFunction: options.sortable ? stringSorter : undefined,
						},
						{
							id: "sobrenome",
							label: "Sobrenome",
							accessor: (row: IEmployee) => row.lastName,
							sortFunction: options.sortable ? stringSorter : undefined,
						},
					],
				},
			] : [
				{
					id: "nome",
					label: "Nome completo",
					accessor: (row: IEmployee) => `${row.firstName} ${row.lastName}`,
					sortFunction: options.sortable ? stringSorter : undefined,
				},
			]
		),
		{
			id: "idade",
			label: "Idade",
			accessor: (row) => row.age,
			sortFunction: options.sortable ? numberSorter : undefined,
		},
		{
			id: "state",
			label: "Estado",
			accessor: (row) => row.state,
			sortFunction: options.sortable ? stringSorter : undefined,
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
		...(
			options.nestedColumns ? [
				{
					id: "expenses",
					label: "Gastos",
					accessor: (row: IEmployee) => row.balanceDetails,
					columns: [
						{
							id: "credit",
							label: "Crédito",
							accessor: (row: IEmployee["balanceDetails"]) => row.credit,
							columns: generateBalanceColumns(options, "credit"),
						},
						{
							id: "debit",
							label: "Débito",
							accessor: (row: IEmployee["balanceDetails"]) => row.debit,
							columns: generateBalanceColumns(options, "debit"),
						},
						{
							id: "cash",
							label: "Dinheiro",
							accessor: (row: IEmployee["balanceDetails"]) => row.cash,
							columns: generateBalanceColumns(options, "cash"),
						},
					],
				},
			] : []
		),
	];
}

export function generatePropsWithFeatures(options: IPropsOptions): IDataTableProps<IEmployee> {
	const coreProps: IDataTableCoreProps<IEmployee> = {
		data: options.emptyData ? [] : employeeData,
		columns: generateColumnsWithFeatures(options),
		idAccessor: (emp) => emp.id,
		...testClasses,
	};

	const categoryProps: IDataTableCategoryProps<IEmployee> = {
		categoryAccessor: (employee) => employee.role,
		categoryLabel: options.categoryLabel ? "Cargo" : undefined,
	};

	const sortProps: IDataTableSortProps = {
		defaultSort: options.defaultSort ? "nome" : undefined,
	};

	const selectionProps: IDataTableSelectProps = {
		selectable: options.selectable,
		onSelect: () => { return; },
		selectedRowsIds: options.undefinedSelected ? undefined : [],
	};

	return {
		...coreProps,
		...(options.sortable ? sortProps : {}),
		...(options.categories ? categoryProps : {}),
		...(options.selectable ? selectionProps : {}),
	};
}

export interface IDescriptedOptionProps {
	description: string;
	featureList: string[];
	options: IPropsOptions;
	props: IDataTableProps<IEmployee>;
}

function getFeatureList(options: IPropsOptions) {
	const enabledOptions = (Object.keys(options) as Array<keyof IPropsOptions>).filter((key) => options[key]);

	return enabledOptions.map((key) => optionsDescriptions[key]).sort();
}

function describeOptions(options: IPropsOptions) {
	const featureList = getFeatureList(options);

	return featureList && featureList.length ? featureList.map((feat) => `[${feat}]`).join(", ") : "plain props";
}

function optionsToDescriptor(options: IPropsOptions): IDescriptedOptionProps {
	return {
		options,
		featureList: getFeatureList(options),
		description: describeOptions(options),
		props: generatePropsWithFeatures(options),
	};
}

function parseDescriptors(descriptors: IPropsOptions[]): IPropsOptions[] {
	if (descriptors.length === 0) {
		return [{}];
	} else {
		const rootDescriptors = [...descriptors];
		const current = rootDescriptors.splice(0, 1)[0];

		const otherOptions = parseDescriptors(rootDescriptors);

		return [ ...otherOptions, ...otherOptions.map((options) => ({ ...options, ...current })) ];
	}
}

const allDescriptors = parseDescriptors(partialOptions);
export const allOptions = allDescriptors.map(optionsToDescriptor);
