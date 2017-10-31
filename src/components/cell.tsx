import * as React from "react";
import classnames from "classnames";
import { selectionCellClassName } from "../utils/privateClassNames";

export interface ISelectionCell {
	selected: boolean;
	isHeader?: boolean;
	disabled?: boolean;
	className?: string;
	onChange(selected: boolean): void;
}

export class SelectionCell extends React.PureComponent<ISelectionCell> {
	private onSelect = (ev: React.ChangeEvent<HTMLInputElement>) => {
		const selected = ev.target.checked;
		this.props.onChange(selected);
	}

	public render() {
		const Element: keyof JSX.IntrinsicElements = this.props.isHeader ? "th" : "td";

		return (
			<Element
				className={classnames(selectionCellClassName, this.props.className)}
			>
				<input
					type="checkbox"
					role="checkbox"
					onChange={this.onSelect}
					checked={this.props.selected}
					disabled={this.props.disabled}
					aria-checked={this.props.selected}
				/>
			</Element>
		);
	}
}
