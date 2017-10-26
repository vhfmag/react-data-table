import * as faker from "faker";
import * as classes from "../utils/publicClassNames";

export interface IBalance {
	toPay: number;
	toReceive: number;
}

export interface IEmployee {
	id: string;
	age: number;
	firstName: string;
	lastName: string;
	role: string;
	birthday: Date;
	balance: number;
	state: string | undefined;
	balanceDetails: {
		credit: IBalance;
		debit: IBalance;
		cash: IBalance;
	};
}

export const testClasses: typeof classes = {
	rowClassName: "row",
	cellClassName: "cell",
	tableClassName: "table",
	ruleRowClassName: "ruleRow",
	tableBodyClassName: "tableBody",
	headerCellClassName: "headerCell",
	tableHeaderClassName: "tableHeader",
};

const stateRoles = [ "Bahia", "São Paulo", "Sergipe", undefined ];
const employeeRoles = [ "CEO", "Senior Dev", "Junior Dev", "Commercial" ];

function fakeMoney() {
	return faker.random.number({ min: 1E3, max: 1E5, precision: 1E-2 });
}

function fakeBalance(): IBalance {
	return {
		toPay: fakeMoney(),
		toReceive: fakeMoney(),
	};
}

export const employeeData: IEmployee[] = [...new Array(faker.random.number({ min: 1E2, max: 2E2 }))].map((_, i) => {
	const age = faker.random.number({ min: 18, max: 100 });

	return {
		age,
		id: i + "",
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		birthday: faker.date.past(age),
		state: faker.random.arrayElement(stateRoles),
		role: faker.random.arrayElement(employeeRoles),
		balance: fakeMoney(),
		balanceDetails: {
			cash: fakeBalance(),
			debit: fakeBalance(),
			credit: fakeBalance(),
		},
	};
});
