import "jest";
import "../../setup";
import { expect } from "chai";
import { mount } from "enzyme";
import { SortArrow } from "../../../components/header";
import * as React from "react";
import * as privateClasses from "../../../utils/privateClassNames";
import { spy } from "sinon";

const noop = () => { return; };
const columnId = "id";

describe("<SortArrow/>", function() {
	describe("dom", function() {
		it("should have only one child", function() {
			expect(
				mount(
					<SortArrow
						active
						descendant
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).children().length,
			).to.be.equal(1);
		});
	});

	describe("behaviour", function() {
		it("should call onChangeSorting on click", function() {
			const callbackSpy = spy();

			const wrapper = mount(
				<SortArrow
					active
					descendant
					columnId={columnId}
					onChangeSorting={callbackSpy}
				/>,
			);

			wrapper.simulate("click");
			expect(callbackSpy.called).to.be.true;
		});

		it("should call onChangeSorting on click with right arguments", function() {
			const callbackSpy = spy();

			const wrapper = mount(
				<SortArrow
					active
					descendant
					columnId={columnId}
					onChangeSorting={callbackSpy}
				/>,
			);

			wrapper.simulate("click");
			const [ colId, descendant ] = callbackSpy.args[0];
			expect(colId, "invalid column id argument").to.be.equal(columnId);
			expect(typeof descendant, "type of descendant argument isn't boolean").to.be.equal("boolean");
		});
	});

	describe("class names", function() {
		it("should always have default class names", function() {
			expect(
				mount(
					<SortArrow
						active
						descendant
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.sortArrowClassName),
			).to.be.true;
		});

		it("should have active class when active", function() {
			expect(
				mount(
					<SortArrow
						active
						descendant
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.activeSortArrowClassName),
			).to.be.true;
		});

		it("should not have active class when not active", function() {
			expect(
				mount(
					<SortArrow
						active={false}
						descendant
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.activeSortArrowClassName),
			).to.be.false;
		});

		it("should have ascendant class when active and not descendant", function() {
			expect(
				mount(
					<SortArrow
						active
						descendant={false}
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.ascendantSortArrowClassName),
			).to.be.true;
		});

		it("should not have ascendant class when not active and not descendant", function() {
			expect(
				mount(
					<SortArrow
						active={false}
						descendant={false}
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.ascendantSortArrowClassName),
			).to.be.false;
		});

		it("should have descendant class when active and descendant", function() {
			expect(
				mount(
					<SortArrow
						active
						descendant={true}
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.descendantSortArrowClassName),
			).to.be.true;
		});

		it("should not have descendant class when not active and descendant", function() {
			expect(
				mount(
					<SortArrow
						active={false}
						descendant={true}
						columnId={columnId}
						onChangeSorting={noop}
					/>,
				).childAt(0).hasClass(privateClasses.descendantSortArrowClassName),
			).to.be.false;
		});
	});
});
