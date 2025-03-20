describe('Employee login test', () => {
  beforeEach(() => {
    cy.visit('/login/employee'); // Visit the employee login page before each test
  });

  it('it should have email and password input, login button and forgot password link', () => {
    // Check for email input
    cy.get('[name="email"] input')
      .should('exist')
      .and('have.attr', 'type', 'email');

    // Check for password input
    cy.get('[name="password"] input')
      .should('exist')
      .and('have.attr', 'type', 'password');

    // Check for login button
    cy.get('[type="submit"] button')
      .should('exist')
      .and('contain', 'Login');

    // Check for forgot password link
    cy.get('[class="login-links"]')
      .should('exist')
      .and('contain', 'Forgot Password?');
  });

  it('if entered petar.p and pp it should login the client and redirect to /user/1', () => {
    // Enter email
    cy.get('[name="email"] input').type('petar.p').blur();

    cy.get('[class="error-message"]').should('exist').contains('Enter a valid email address.');
    // Enter password
    cy.get('[name="password"] input').type('pp').blur();
    cy.get('[class="error-message"]').should('exist').contains('Minimum length is 3 characters.');

  });

  it('if entered petar.p@example.com and petarpetar it should login the employee and redirect to /client-portal', () => {
    // Enter email
    cy.get('[name="email"] input').type('petar.p@example.com');

    // Enter password
    cy.get('[name="password"] input').type('petarpetar');

    // Click login button
    cy.get('[type="submit"] button').click();

    // Verify redirection to /client-portal
    cy.url().should('include', '/client-portal');
  });

  it('if i backtrack to / or /login it should redirect me back to client-portal', () => {
    // Log in first
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();

    // Wait for redirection to /client-portal
    cy.url().should('include', '/client-portal');

    // Try to backtrack to /
    cy.visit('/');
    cy.url().should('include', '/client-portal'); // Should redirect back to /client-portal

    // Try to backtrack to /login
    cy.visit('/login');
    cy.url().should('include', '/client-portal'); // Should redirect back to /client-portal
  });
});
