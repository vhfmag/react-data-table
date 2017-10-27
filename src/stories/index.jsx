import * as React from "react";
import DataTable from "../";
import { allOptions } from "../data/props";
import { storiesOf } from "@storybook/react";

const stories = storiesOf("DataTable", module);

const featuresSet = new Set();

for (const descriptor of allOptions) {
    const features = descriptor.featureList.join(", ") || "plain default options";

    if (!featuresSet.has(features)) {
        stories.add(features, () => (
            <DataTable {...descriptor.props}/>
        ));

        featuresSet.add(features);
    }
}
