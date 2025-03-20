describe('Welcome Page Test', () => {
  beforeEach(() => {
    cy.visit('/'); // Visit the home page before each test
  });

  it('should have Employee Login and Client Login buttons', () => {
    // Check if the Employee Login button exists
    cy.get('[class="employee-btn"]')
      .should('exist')
      .and('contain', 'Employee Login');

    // Check if the Client Login button exists
    cy.get('[class="user-btn"]')
      .should('exist')
      .and('contain', 'User Login');
  });

  it('should navigate to /employee/login when Employee Login is clicked', () => {
    // Click the Employee Login button
    cy.get('[class="employee-btn"]').click();

    // Verify the URL after clicking
    cy.url().should('include', '/login/employee');
  });

  it('should navigate to /client/login when Client Login is clicked', () => {
    // Click the Client Login button
    cy.get('[class="user-btn"]').click();

    // Verify the URL after clicking
    cy.url().should('include', '/login/client');
  });
});
