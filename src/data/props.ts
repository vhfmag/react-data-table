import { dateSorter, numberSorter, stringSorter } from "../utils/sorters";
import { IColumn, IDataTableCategoryProps, IDataTableCoreProps, IDataTableProps, IDataTableSortProps } from "..";
import { employeeData, IBalance, IEmployee, testClasses } from "./data";

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

	// nested columns
	nestedColumns?: boolean;
}

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

export interface IDescriptedOptionProps {
	description: string;
	featureList: string[];
	options: IPropsOptions;
	props: IDataTableProps<IEmployee>;
}

interface IOptionsDescriptor extends IPropsOptions {
	children?: IOptionsDescriptor[];
}

const partialOptions: IOptionsDescriptor[] = [
	{
		emptyData: true,
	},
	{
		disableIdAccessor: true,
	},
	{
		nestedColumns: true,
	},
	{
		sortable: true,
		children: [ { defaultSort: true } ],
	},
	{
		categories: true,
		children: [ { categoryLabel: true } ],
	},
];

function getFeatureList(options: IPropsOptions) {
	const featureList: string[] = [];

	if (options.emptyData) {
		featureList.push("empty state");
	}

	if (options.categories) {
		featureList.push("categories feature");

		if (options.categoryLabel) {
			featureList.push("category label");
		}
	}

	if (options.sortable) {
		featureList.push("sorting feature");

		if (options.defaultSort) {
			featureList.push("default sort");
		}
	}

	if (options.disableIdAccessor) {
		featureList.push("no id accessor");
	}

	if (options.nestedColumns) {
		featureList.push("nested columns");
	}

	return featureList;
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

function parseDescriptors(descriptors: IOptionsDescriptor[]): IPropsOptions[] {
	if (descriptors.length === 0) {
		return [{}];
	} else {
		const rootDescriptors = [...descriptors];
		const { children, ...current } = rootDescriptors.splice(0, 1)[0];

		const otherDescriptors = children ? [ ...rootDescriptors, ...children ] : rootDescriptors;

		const otherOptions = parseDescriptors(otherDescriptors);

		return [ ...otherOptions, ...otherOptions.map((options) => ({ ...options, ...current })) ];
	}
}

const allDescriptors = parseDescriptors(partialOptions);
export const allOptions = allDescriptors.map(optionsToDescriptor);
