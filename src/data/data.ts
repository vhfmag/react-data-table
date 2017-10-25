import * as faker from "faker";
import * as classes from "../classes";

export interface IEmployee {
	id: string;
	age: number;
	name: string;
	birthday: Date;
	balance: number;
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

export const employeeData: IEmployee[] = [...new Array(faker.random.number({ min: 10, max: 30 }))].map((_, i) => {
	const age = faker.random.number({ min: 18, max: 60 });
	return {
		age,
		id: i + "",
		name: faker.name.findName(),
		birthday: faker.date.past(age),
		balance: faker.random.number({ min: 1E3, max: 1E5 }),
	};
});
