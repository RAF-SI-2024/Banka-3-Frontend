describe('Employee login and create account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee');
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
  });
  it('should navigate to employees page, go to register new employee, and create an employee', () => {
    cy.get('.sidebar-link').contains('Employees').click();

    cy.get('[class="register-btn"] button').contains('Register new employee').click();
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
    cy.get('[formcontrolname="gender"]').select('M');
    cy.get('[formcontrolname="birthDate"] input').type('1990-01-01');
    cy.get('[formcontrolname="active"]').select('true');
    cy.get('[formcontrolname="role"]').select('ADMIN');

    cy.get('[type="submit"] > button').click();
  });

});
describe('Employee login and create user account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee');
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
  });
  it('should go to register new user, and create an user', () => {
    cy.get('app-button > button').contains('Register New User').click();
    cy.url().should('include', '/register-user');

    cy.get('[formcontrolname="firstName"] input').type('John');
    cy.get('[formcontrolname="lastName"] input').type('Doe');
    cy.get('[formcontrolname="email"] input').type('john.doe@example.com');
    cy.get('[formcontrolname="jmbg"] input').type('1234567890123');
    cy.get('[formcontrolname="username"] input').type('johndoe');
    cy.get('[formcontrolname="phone"] input').type('1234567890');
    cy.get('[formcontrolname="address"] input').type('123 Main St');
    cy.get('[formcontrolname="password"] input').type('password123');
    cy.get('[formcontrolname="gender"]').select('M');
    cy.get('[formcontrolname="birthDate"] input').type('1990-01-01');

    cy.get('[type="submit"] > button').click();
  });

  it('should go to edit user, and update user', () => {
    cy.get(':nth-child(1) > .flex > [tabindex="0"] > button').contains('Edit User').click();

    cy.get('[formcontrolname="lastName"] input').clear().type('Doe');
    cy.get('[formcontrolname="phone"] input').clear().type('1234567890');
    cy.get('[formcontrolname="gender"]').select('F');
    cy.get('[formcontrolname="address"] input').clear().type('Test address');

    cy.get('[type="submit"] > button').click();

    cy.visit('/client-portal');
    cy.get('[class="client-list"]').should('exist').contains('Doe');
  });

  it('should delete user', () => {
    // cy.get(':nth-child(1) > .client-info > .client-name > strong').should('contain', 'Doe')
    // cy.get(':nth-child(1) > .flex > :nth-child(3) > button').contains('Delete User').click();
    // cy.get(':nth-child(1) > .client-info > .client-name > strong').should('not.contain', 'Doe')
  });
});
