// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for Hebrew RTL testing
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      createRecipe(recipe: any): Chainable<void>
      waitForRecipeLoad(): Chainable<void>
      checkRTLLayout(): Chainable<void>
    }
  }
}

// Helper functions for Hebrew testing
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/')
    // Add login logic when authentication is implemented
  })
})

Cypress.Commands.add('createRecipe', (recipe) => {
  cy.visit('/recipe/new')
  cy.get('[data-testid="recipe-title"]').type(recipe.title)
  cy.get('[data-testid="recipe-description"]').type(recipe.description)
  cy.get('[data-testid="recipe-category"]').click()
  cy.get(`[data-value="${recipe.category}"]`).click()
  // Add more form filling logic
  cy.get('[data-testid="submit-recipe"]').click()
})

Cypress.Commands.add('waitForRecipeLoad', () => {
  cy.get('[data-testid="recipe-loading"]').should('not.exist')
  cy.get('[data-testid="recipe-content"]').should('be.visible')
})

Cypress.Commands.add('checkRTLLayout', () => {
  cy.get('html').should('have.attr', 'dir', 'rtl')
  cy.get('body').should('have.css', 'direction', 'rtl')
})

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions from the application
  // This is particularly useful during development
  console.log('Uncaught exception:', err.message)
  return false
})