/* @refresh reload */
import { render } from "solid-js/web";

import Index from "./index";

// XXX: Extra DOM element and extra import seem to be required for HMR.
render(() => <Index />, document.getElementById("root")!);
