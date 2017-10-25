import { IDataTableCategoryProps, IDataTableProps } from "../";
import { employeePropsWithId } from "./core.props";
import { IEmployee } from "./data";

export const categorizedEmployeeProps: IDataTableProps<IEmployee> & IDataTableCategoryProps<IEmployee> = {
	...employeePropsWithId,
	categoryAccessor: (emp) => emp.role,
};

export const categorizedAndLabeledEmployeeProps: typeof categorizedEmployeeProps = {
	...categorizedEmployeeProps,
	categoryLabel: "Cargo",
};
