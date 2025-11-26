import { cli, define } from "gunshi";
import { renderHeader as defaultHeaderRenderer } from "gunshi/renderer";
import { dirname, resolve } from "pathe";
import { ResolverFactory } from "unrs-resolver";

import {
  description as pkgDescription,
  name as pkgName,
  version as pkgVersion,
} from "../package.json" with { type: "json" };

const cmd = define({
  args: {
    from: {
      description:
        "Path to resolve modules from (e.g., '/path/to/project/src/index.ts')",
      required: true,
      type: "string",
    },
    moduleRequest: {
      description: "Module request to resolve (e.g., 'lodash', './utils')",
      required: true,
      type: "positional",
    },
  } as const,
  name: "nrph",
  run: async (c) => {
    const fromDir = dirname(resolve(c.values.from));
    const resolver = new ResolverFactory();
    const result = await resolver.async(fromDir, c.values.moduleRequest);
    if (isNonEmptyString(result.error)) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.builtin) {
      console.log(result.builtin.resolved);
      process.exit(0);
    }

    if (isNonEmptyString(result.path)) {
      console.log(result.path);
      process.exit(0);
    }

    console.error("Error: Unable to resolve module");
    process.exit(1);
  },
});

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function runNrph(args: string[]) {
  return await cli(args, cmd, {
    description: pkgDescription,
    name: pkgName,
    renderHeader: async (c) => {
      // @ts-expect-error auto defined by gunshi
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (c.values.help || c.values.version) {
        return defaultHeaderRenderer(c);
      }
      return "";
    },
    version: pkgVersion,
  });
}
