import * as React from "react";
import DataTable from "../";
import { storiesOf } from "@kadira/storybook";
import { emptyProps, employeeProps } from "../data/core.props";

const story = storiesOf("DataTable/core", module);
story.add("Empty state", () => <DataTable {...emptyProps}/>);
story.add("Core features", () => <DataTable {...employeeProps}/>);
