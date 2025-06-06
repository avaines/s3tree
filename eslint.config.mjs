import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["./src/**/*.js"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  {
    files: ["./src/**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "no-console": "off",
      "no-undef": "off",
    },
    languageOptions: {
      globals: globals.browser
    }
  }
]);
