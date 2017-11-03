import { dateSorter, isSome, numberSorter, stringSorter } from "../utils/sorters";
import {
	IColumn,
	IDataTableCategoryProps,
	IDataTableCoreProps,
	IDataTableProps,
	IDataTableSelectProps,
	IDataTableSortProps,
	IDataTableTotalProps,
	INullableObject,
} from "..";
import { employeeData, IBalance, IEmployee, testClasses } from "./data";

export interface IPropsOptions {
	// core features
	emptyData?: boolean;

	// category features
	categories?: boolean;

	// sorting features
	sortable?: boolean;
	defaultSort?: boolean;

	// nested columns
	nestedColumns?: boolean;

	// row selection
	selectable?: boolean;
	undefinedSelected?: boolean;

	// totalizing
	totalized?: boolean;
	hideTotalRow?: boolean;
	hideCategoryRow?: boolean;
}

interface INestedOptions extends IPropsOptions {
	children?: INestedOptions[];
}

const partialOptions: INestedOptions[] = [
	{ emptyData: true },
	{ categories: true },
	{ nestedColumns: true },
	{ sortable: true, children: [ { defaultSort: true } ] },
	{ selectable: true, children: [ { undefinedSelected: true } ] },
	{ totalized: true, children: [ { hideTotalRow: true }, { hideCategoryRow: true } ] },
];

const optionsDescriptions: { [key in keyof IPropsOptions]: string } = {
	emptyData: "empty state",
	categories: "categories features",
	sortable: "sorting feature",
	defaultSort: "default sort",
	nestedColumns: "nested columns",
	selectable: "selectable",
	undefinedSelected: "undefined selectedRowsIds prop",
	totalized: "total feature",
	hideTotalRow: "hide table total row",
	hideCategoryRow: "total category total row",
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

const renderCurrency = (v: number | null | undefined) => isSome(v) ? v.toLocaleString("pt-br", { style: "currency", currency: "BRL" }) : null;

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
					accessor: (row: IEmployee) => [row.firstName, row.lastName].filter((v) => v).join(" "),
					sortFunction: options.sortable ? stringSorter : undefined,
				},
			]
		),
		{
			id: "idade",
			label: "Idade",
			accessor: (row) => row.age,
			sortFunction: options.sortable ? numberSorter : undefined,
			renderAggregate: (val: number | null | undefined) => isSome(val) ? val.toFixed(0) + " (média)" : null,
		},
		{
			id: "state",
			label: "Estado",
			accessor: (row) => row.state,
			sortFunction: options.sortable ? stringSorter : undefined,
		},
		{
			id: "old roles",
			label: "Cargos Antigos",
			accessor: (row) => row.oldRoles,
			renderCell: (roles: string[] | undefined) => roles || "nenhum",
		},
		{
			id: "birthday",
			label: "Nascimento",
			accessor: (row) => row.birthday,
			renderCell: (d: Date | null | undefined) => isSome(d) ? d.toLocaleDateString("pt-br") : null,
			sortFunction: options.sortable ? dateSorter : undefined,
		},
		{
			id: "balance",
			label: "Saldo",
			accessor: (row) => row.balance,
			sortFunction: options.sortable ? numberSorter : undefined,
			renderCell: renderCurrency,
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
							renderCell: renderCurrency,
						},
						{
							id: "debit",
							label: "Débito",
							accessor: (row: IEmployee["balanceDetails"]) => row.debit,
							columns: generateBalanceColumns(options, "debit"),
							renderCell: renderCurrency,
						},
						{
							id: "cash",
							label: "Dinheiro",
							accessor: (row: IEmployee["balanceDetails"]) => row.cash,
							columns: generateBalanceColumns(options, "cash"),
							renderCell: renderCurrency,
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

	const categoryProps: Partial<IDataTableCategoryProps<IEmployee>> = {
		categoryAccessor: options.categories ? (employee) => employee.role : undefined,
	};

	const sortProps: IDataTableSortProps = {
		defaultSort: options.defaultSort ? "nome" : undefined,
	};

	const selectionProps: Partial<IDataTableSelectProps> = {
		selectable: options.selectable,
		onSelect: options.selectable ? () => { return; } : undefined,
		selectedRowsIds: options.selectable && !options.undefinedSelected ? [] : undefined,
	};

	const totalProps: Partial<IDataTableTotalProps<IEmployee>> = {
		totalAccessor:
			options.totalized ?
				(emps) => emps.reduce<INullableObject<IEmployee>>(
					(emp1, emp2) => {
						return {
							age: (emp1.age || 0) + emp2.age / emps.length,
							balance: (emp1.balance || 0) + emp2.balance,
							balanceDetails: {
								cash: {
									toPay: (emp1.balanceDetails && emp1.balanceDetails.cash.toPay || 0) + emp2.balanceDetails.cash.toPay,
									toReceive: (emp1.balanceDetails && emp1.balanceDetails.cash.toReceive || 0) + emp2.balanceDetails.cash.toReceive,
								},
								credit: {
									toPay: (emp1.balanceDetails && emp1.balanceDetails.credit.toPay || 0) + emp2.balanceDetails.credit.toPay,
									toReceive: (emp1.balanceDetails && emp1.balanceDetails.credit.toReceive || 0) + emp2.balanceDetails.credit.toReceive,
								},
								debit: {
									toPay: (emp1.balanceDetails && emp1.balanceDetails.debit.toPay || 0) + emp2.balanceDetails.debit.toPay,
									toReceive: (emp1.balanceDetails && emp1.balanceDetails.debit.toReceive || 0) + emp2.balanceDetails.debit.toReceive,
								},
							},
							id: null,
							birthday: null,
							firstName: "Total",
							lastName: null,
						};
					},
					{},
				)
			: undefined,
	};

	return {
		...coreProps,
		...sortProps,
		...totalProps,
		...categoryProps,
		...selectionProps,
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

function parseDescriptors(descriptors: INestedOptions[]): IPropsOptions[] {
	if (descriptors.length === 0) {
		return [{}];
	} else {
		const rootDescriptors = [...descriptors];
		const {children, ...current} = rootDescriptors.splice(0, 1)[0];
		const childrenDescriptors = children || [];

		const otherOptions = parseDescriptors(rootDescriptors);
		const childrenOptions = parseDescriptors(childrenDescriptors);
		const otherOptionsAndChildren = [...otherOptions, ...childrenOptions];

		return [ ...otherOptions, ...otherOptionsAndChildren.map((options) => ({ ...options, ...current })) ];
	}
}

const allDescriptors = parseDescriptors(partialOptions);
export const allOptions = allDescriptors.map(optionsToDescriptor);
