const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const jestCreateConfig = nextJest({
  dir: ".",
});

const jestConfig = jestCreateConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 600,
});

module.exports = jestConfig;
