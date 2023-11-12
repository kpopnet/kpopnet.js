import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { setUncaughtExceptionCaptureCallback } from "node:process";

// https://github.com/TypeStrong/ts-node/issues/2026
setUncaughtExceptionCaptureCallback((err) => {
  console.error(err);
  process.exit(1);
});

register("ts-node/esm", pathToFileURL("./"));
