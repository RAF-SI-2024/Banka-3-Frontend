import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "mocha-multi-reporters",
  reporterOptions: {
    reporterEnabled: "spec, mocha-junit-reporter",
    mochaJunitReporterReporterOptions: {
      mochaFile: "target/site/jacoco/results.xml",
      toConsole: false
    }
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/tests/e2e/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/commands.ts'
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },

    specPattern: '**/*.cy.ts',
  },
});
