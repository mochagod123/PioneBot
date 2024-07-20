import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylisticTs from "@stylistic/eslint-plugin-ts";

export default [
  { "files": ["**/*.{js,mjs,cjs,ts}"] },
  { "languageOptions": { "globals": globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "plugins": {
      "@stylistic/ts": stylisticTs
    },
    "rules": {
      "@/linebreak-style": ["error", "unix"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "@stylistic/ts/indent": ["error", 4],
      "@stylistic/ts/quotes": ["error", "double"],
      "@stylistic/ts/semi": ["error", "always"],
      "@stylistic/ts/comma-dangle": ["error", "never"]
    }
  }
];
