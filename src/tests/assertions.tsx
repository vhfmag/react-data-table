import "jest";
import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";

import "./setup";

export function shouldntThrowWithProps<Props>(props: Props, Component: React.ComponentClass<Props>) {
	it("should pass smoke test", function() {
		mount(<Component {...props}/>);
	});
}

export function testEnvironment() {
	describe("the environment", function() {
		it("jest + chai should work", function() {
			expect(true).to.be.true;
		});

		it("enzyme should work", () => {
			mount(<span/>);
		});
	});
}
