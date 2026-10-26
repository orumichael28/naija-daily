/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/games/**/*.ts",
    "src/lib/**/*.ts",
    "src/hooks/**/*.ts",
  ],
};

module.exports = config;

