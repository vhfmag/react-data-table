import * as faker from "faker";
import * as classes from "../utils/publicClassNames";

export interface IEmployee {
	id: string;
	age: number;
	name: string;
	role: string;
	birthday: Date;
	balance: number;
	state: string | undefined;
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

export const employeeData: IEmployee[] = [...new Array(faker.random.number({ min: 1E2, max: 2E2 }))].map((_, i) => {
	const age = faker.random.number({ min: 18, max: 100 });

	return {
		age,
		id: i + "",
		name: faker.name.findName(),
		birthday: faker.date.past(age),
		state: faker.random.arrayElement(stateRoles),
		role: faker.random.arrayElement(employeeRoles),
		balance: faker.random.number({ min: 1E3, max: 1E5, precision: 1E-2 }),
	};
});
