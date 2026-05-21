import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|svg)$": "<rootDir>/tests/mocks/fileMock.ts",
  },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/actions/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/app/api/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json-summary"],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testEnvironmentOptions: {
    url: "http://localhost",
  },
};

export default createJestConfig(customJestConfig);