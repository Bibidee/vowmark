import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);
const compat = new FlatCompat({ baseDirectory: directory });

const configs = [...compat.extends("next/core-web-vitals", "next/typescript")];
const finalConfig = [...configs, globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"])];

export default finalConfig;
