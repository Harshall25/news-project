const nextJest = require("next/jest") // eslint-disable-line @typescript-eslint/no-require-imports -- CJS config file, require() is correct here

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  coverageDirectory: "coverage",
  // json-summary is required by jest-coverage-badges: it reads
  // coverage/coverage-summary.json to generate the badges.
  coverageReporters: ["json-summary", "text", "lcov"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
}

module.exports = createJestConfig(customJestConfig)
