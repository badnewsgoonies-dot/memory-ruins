// jest.config.js
module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "tsconfig.json",
    }],
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  // The test environment that will be used for testing
  testEnvironment: "node",


  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)",
    "**/?(*.)+(spec|test).js?(x)", // Add this line to include .js test files
    "**/tests/**/*.ts?(x)",
  ],

  // A list of paths to modules that run some code to configure or set up the testing environment before each test
  setupFilesAfterEnv: [],
};
