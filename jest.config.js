module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["<rootDir>/src/", "<rootDir>/dist"],
  testMatch: ["**/?(*.)+(spec|test).[t]s?(x)", "!**/tests/zokrates.test.ts"], //only match ts files and do not test the old invalid one
};