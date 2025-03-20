describe('Employee login and create account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee'); // Visit the employee login page before each test
  });
  it('should navigate to employees page, go to register new employee, and create an employee', () => {
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
    cy.url().should('include', '/client-portal');

    cy.visit('/employees');

    cy.get('button').contains('Register new employee').click();
    cy.url().should('include', '/register-employee');

    cy.get('[formcontrolname="firstName"] input').type('John');
    cy.get('[formcontrolname="lastName"] input').type('Doe');
    cy.get('[formcontrolname="email"] input').type('john.doe@example.com');
    cy.get('[formcontrolname="jmbg"] input').type('1234567890123');
    cy.get('[formcontrolname="username"] input').type('johndoe');
    cy.get('[formcontrolname="phone"] input').type('1234567890');
    cy.get('[formcontrolname="address"] input').type('123 Main St');
    cy.get('[formcontrolname="position"] input').type('Manager');
    cy.get('[formcontrolname="department"] input').type('HR1');
    cy.get('[formcontrolname="gender"] select').select('M');
    cy.get('[formcontrolname="birthDate"] input').type('1990-01-01');
    cy.get('[formcontrolname="active"] select').select('true');

    cy.get('app-button > button').click();
  });

});
