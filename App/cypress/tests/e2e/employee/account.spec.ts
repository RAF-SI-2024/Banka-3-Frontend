describe('Employee login and create account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee'); // Visit the employee login page before each test
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
    cy.url().should('include', '/client-portal');
  });

  it('should navigate to new account, fill form, and submit', () => {

    cy.get('aside').contains('New Account').click();
    cy.get('.modal-overlay').contains('Checking Account').click();
    cy.url().should('include', '/create-current-account');

    cy.get('[name="clientId"]').select('0: 1');
    cy.get('[name="accountOwnerType"]').select('PERSONAL');
    cy.get('[name="dailyLimit"]').clear().type('5000');
    cy.get('[name="monthlyLimit"]').clear().type('20000');
    cy.get('[type="submit"].submit-btn').click();
    cy.get('.alert-container > span').should('exist');
  });

  it('should navigate to new foreign account, fill form, and submit', () => {
    cy.get('aside').contains('New Account').click();
    cy.get('.modal-overlay').contains('Foreign Currency Account').click();
    cy.url().should('include', '/create-foreign-currency-account');

    cy.get('[id="clientId"]').select('1');
    cy.get('[id="currency"]').select('EUR');
    cy.get('[id="dailyLimit"]').clear().type('5000');
    cy.get('[id="monthlyLimit"]').clear().type('20000');
    cy.get('[type="submit"].submit-btn').click();
    cy.get('.alert-container > span').should('exist');
  });
});
