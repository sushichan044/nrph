#!/usr/bin/env node

import { runNrph } from "../dist/index.mjs";

runNrph(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
