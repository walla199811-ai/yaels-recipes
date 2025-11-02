import { defineConfig } from 'cypress'

export default defineConfig({
  // E2E Testing
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },

  // Component Testing
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 1000,
    viewportHeight: 660,
    video: false,
    screenshotOnRunFailure: true,
  },

  // Global settings
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  blockHosts: [],

  env: {
    // Add any environment variables needed for testing
    DATABASE_URL: 'postgresql://yotamalfassy@localhost:5432/yaels_recipes_test?schema=public',
  },
})