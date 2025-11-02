/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject?: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Database commands for testing
Cypress.Commands.add('resetDatabase', () => {
  cy.task('db:seed')
})

Cypress.Commands.add('createTestRecipe', (recipeData) => {
  return cy.request({
    method: 'POST',
    url: '/api/recipes',
    body: recipeData,
  })
})

// Hebrew text testing utilities
Cypress.Commands.add('typeHebrew', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).type(text, { delay: 50 })
})

Cypress.Commands.add('shouldContainHebrew', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain', text)
})

// RTL testing utilities
Cypress.Commands.add('shouldBeRTL', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('have.css', 'direction', 'rtl')
})

declare global {
  namespace Cypress {
    interface Chainable {
      resetDatabase(): Chainable<void>
      createTestRecipe(recipeData: any): Chainable<any>
      typeHebrew(text: string): Chainable<Element>
      shouldContainHebrew(text: string): Chainable<Element>
      shouldBeRTL(): Chainable<Element>
    }
  }
}