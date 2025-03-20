/// <reference types="cypress" />

// Helper function to log in as employee
Cypress.Commands.add('loginAsEmployee', () => {
  cy.visit('/login/employee');
  cy.get('[name="email"] input').type('petar.p@example.com');
  cy.get('[name="password"] input').type('petarpetar');
  cy.get('[type="submit"] button').click();
  cy.url().should('include', '/client-portal');
});

// Helper function to log in as client
Cypress.Commands.add('loginAsClient', () => {
  cy.visit('/login/client');
  cy.get('[name="email"] input').type('marko.m@example.com');
  cy.get('[name="password"] input').type('markomarko');
  cy.get('[type="submit"] button').click();
  cy.url().should('include', '/user/1');
});

// Extend Cypress types for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in as an employee.
       */
      loginAsEmployee(): Chainable<void>;

      /**
       * Logs in as a client.
       */
      loginAsClient(): Chainable<void>;
    }
  }
}

// Export an empty object to make this file a module
export {};
