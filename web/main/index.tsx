/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";
import Main from "./main";

// XXX: Extra DOM element and extra import seem to be required for HMR.
render(() => <Main />, document.getElementById("index")!);
