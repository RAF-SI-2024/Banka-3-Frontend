describe('Employee login test', () => {
  beforeEach(() => {
    cy.visit('/login/client'); // Visit the client login page before each test
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

  it('if entered marko.m and markomarko it should login the client and redirect to /user/1', () => {
    // Enter email
    cy.get('[name="email"] input').type('marko.m').blur();

    cy.get('[class="error-message"]').should('exist').contains('Enter a valid email address.');
    // Enter password
    cy.get('[name="password"] input').type('ma').blur();
    cy.get('[class="error-message"]').should('exist').contains('Minimum length is 3 characters.');

  });


  it('if entered marko.m@example.com and markomarko it should login the client and redirect to /user/1', () => {
    // Enter email
    cy.get('[name="email"] input').type('marko.m@example.com');

    // Enter password
    cy.get('[name="password"] input').type('markomarko');

    // Click login button
    cy.get('[type="submit"] button').click();

    // Verify redirection to /user/1
    cy.url().should('include', '/user/1');
  });

  it('if i backtrack to / or /login it should redirect me back to user/1', () => {
    // Log in first
    cy.get('[name="email"] input').type('marko.m@example.com');
    cy.get('[name="password"] input').type('markomarko');
    cy.get('[type="submit"] button').click();

    // Wait for redirection to /user/1
    cy.url().should('include', '/user/1');

    // Try to backtrack to /
    cy.visit('/');
    cy.url().should('include', '/user/1'); // Should redirect back to /user/1

    // Try to backtrack to /login
    cy.visit('/login');
    cy.url().should('include', '/user/1'); // Should redirect back to /user/1
  });
});
