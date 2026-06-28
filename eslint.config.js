import tseslint from "typescript-eslint";

const adminImportRestriction = {
  group: ["**/features/dashboard/admin/**"],
  message:
    "Public and Hyperview routes must import shared logic from src/domain/, not admin UI features.",
};

export default tseslint.config(
  {
    files: [
      "src/fs-routes/(app)/**/*.{ts,tsx}",
      "src/fs-routes/hyperview/**/*.{ts,tsx}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-restricted-imports": ["error", { patterns: [adminImportRestriction] }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "src/fs-routes.manifest.ts"],
  },
);
