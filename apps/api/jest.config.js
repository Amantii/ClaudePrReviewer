/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^@pr-reviewer/shared$":
      "<rootDir>/../../packages/shared/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "CommonJS" } }],
  },
  moduleFileExtensions: ["ts", "js", "json"],
};
