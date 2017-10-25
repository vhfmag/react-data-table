import { IColumn, IDataTableProps } from "..";
import { IEmployee, employeeData, testClasses } from "./data";

const employeeColumns: Array<IColumn<IEmployee>> = [
	{
		id: "nome",
		label: "Nome",
		accessor: (row) => row.name,
	},
	{
		id: "idade",
		label: "Idade",
		accessor: (row) => row.age,
	},
	{
		id: "birthday",
		label: "Nascimento",
		accessor: (row) => row.birthday,
		renderCell: (d: Date) => d.toDateString(),
	},
	{
		id: "balance",
		label: "Saldo",
		accessor: (row) => row.balance,
		renderCell: (n: number) => n.toLocaleString("pt-br", { style: "currency", currency: "BRL" }),
	},
];

const idAccessor = <T extends {id: string}>(t: T) => t.id;

export const employeePropsWithId: IDataTableProps<IEmployee> = {
	idAccessor,
	data: employeeData,
	columns: employeeColumns,
	...testClasses,
};

export const employeePropsWithoutId: IDataTableProps<IEmployee> = {
	data: employeeData,
	columns: employeeColumns,
	...testClasses,
};

export const emptyProps: IDataTableProps<never> = {
	data: [],
	columns: [],
};
