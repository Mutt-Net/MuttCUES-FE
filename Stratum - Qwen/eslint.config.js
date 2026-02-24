import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { 
    ignores: [
      "dist", 
      "node_modules", 
      "coverage",
      "*.config.js",
      "*.config.ts",
      "vite.config.*",
      "vitest.config.*",
      "eslint.config.js",
      "*.tsx.bak",
      "*_backup.tsx"
    ] 
  },
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: false, // Disable type-aware linting for performance
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
