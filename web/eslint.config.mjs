import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

const finalConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
  {
    rules: {
      // VOWMARK intentionally performs RPC reconciliation from effects and
      // samples the current clock when classifying deadline-driven records.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default finalConfig;
