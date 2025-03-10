import typescript from "@zemd/eslint-ts";

export default [
  ...typescript(),
  {
    name: "zemd/override",
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": ["off"],
      "sonarjs/function-return-type": ["off"],
      "@typescript-eslint/no-unsafe-function-type": ["off"],
      "sonarjs/no-commented-code": ["off"],
      "sonarjs/no-nested-functions": ["off"],
      "sonarjs/cognitive-complexity": ["off"],
    },
  },
];
