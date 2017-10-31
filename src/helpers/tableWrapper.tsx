import { spy } from "sinon";
import * as React from "react";
import DataTable, { IDataTableProps } from "../";

export interface IStatefulSelectedWrapperState {
	selected: string[];
}

export class StatefulSelectedWrapper<T extends object> extends React.Component<IDataTableProps<T>, IStatefulSelectedWrapperState> {
	constructor(props: IDataTableProps<T>) {
		super(props);

		this.state = { selected: this.props.selectedRowsIds || [] };
	}

	public onSelect = spy((selected: string[]) => {
		this.setState({ selected });
	});

	public render() {
		return (
			<DataTable
				{...this.props}

				onSelect={this.onSelect}
				selectedRowsIds={this.state.selected}
			/>
		);
	}
}
