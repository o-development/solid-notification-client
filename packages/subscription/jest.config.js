module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/test/"],
  testRegex: ["/test/.*.test.*.ts$"],
};
