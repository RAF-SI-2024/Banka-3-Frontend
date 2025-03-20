import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/tests/e2e/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/commands.ts',
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    
    specPattern: '**/*.cy.ts',
  },
});
