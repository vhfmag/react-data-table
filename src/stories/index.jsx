import * as React from "react";
import { StatefulSelectedWrapper } from "../helpers/tableWrapper";
import { allOptions,  } from "../data/props";
import { storiesOf } from "@storybook/react";
import "../loadStyle";

const stories = storiesOf("DataTable", module);

const featuresSet = new Set();

for (const descriptor of allOptions) {
    const features = descriptor.description;

    if (!featuresSet.has(features)) {
        stories.add(features, () => (
            <StatefulSelectedWrapper {...descriptor.props}/>
        ));

        featuresSet.add(features);
    }
}
