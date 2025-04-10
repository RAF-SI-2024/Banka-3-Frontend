describe('Login Forms have necessary fields', () => {
  const checkLoginForm = (url: string) => {
    cy.visit(url);

    cy.get('[name="email"] input')
      .should('exist')
      .and('have.attr', 'type', 'email');

    cy.get('[name="password"] input')
      .should('exist')
      .and('have.attr', 'type', 'password');

    cy.get('[type="submit"] button')
      .should('exist')
      .and('contain', 'Login');

    cy.get('a').contains('Forgot Password?')
      .should('exist')
      .click();

    cy.url().should('include', '/forgot-password');
  };

  it('all inputs and links exist on login forms', () => {
    checkLoginForm('/login/employee');
    checkLoginForm('/login/client');
  });
});

describe('Employee login test', () => {
  beforeEach(() => { cy.visit('/login/employee'); });

  it('if entered petar.p and pp it should display error messages', () => {
    // Enter email
    cy.get('[name="email"] input').type('petar.p').blur();
    cy.get('[class="error-message"]').should('exist').contains('Enter a valid email address.');
    // Enter password
    cy.get('[name="password"] input').type('pp').blur();
    cy.get('[class="error-message"]').should('exist').contains('Minimum length is 3 characters.');
  });

  it('if entered petar.p@example.com and petarpetar it should login the employee and redirect to /client-portal', () => {
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();

    cy.url().should('include', '/client-portal');
  });
});
describe('Client login test', () => {
  beforeEach(() => { cy.visit('/login/client'); });

  it('if entered marko.m and mm it should display error messages', () => {
    // Enter email
    cy.get('[name="email"] input').type('marko.m').blur();
    cy.get('[class="error-message"]').should('exist').contains('Enter a valid email address.');
    // Enter password
    cy.get('[name="password"] input').type('mm').blur();
    cy.get('[class="error-message"]').should('exist').contains('Minimum length is 3 characters.');
  });

  it('if entered marko.m@example.com and markomarko it should login the employee and redirect to /user', () => {
    cy.get('[name="email"] input').type('marko.m@example.com');
    cy.get('[name="password"] input').type('markomarko');
    cy.get('[type="submit"] button').click();

    cy.url().should('include', '/user/');
  });
});
