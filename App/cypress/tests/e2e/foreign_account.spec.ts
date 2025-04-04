describe('foreign currency account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee'); // Visit the employee login page before each test
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
    cy.url().should('include', '/client-portal');
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management?id=1');

  });

  it('loads the form correctly', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('h2').should('exist').and('contain', 'Create New');
    cy.get('form').should('exist');
  });

  it('fills in and submits the form for a personal account', () => {
    // Select a client
    cy.get('table tr').its('length').then((initialRowCount) => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
      cy.get('#clientId').select('1: 1'); // Replace with a valid client ID

      // Choose account owner type
      cy.get('#accountOwnerType').select('PERSONAL');

      // Select currency
      cy.get('#currency').select('USD');

      // Enter daily and monthly limits
      cy.get('#dailyLimit').type('5000');
      cy.get('#monthlyLimit').type('20000');

      // Check "Is Active"
      cy.get('#isActive').check();

      // Check "Create Card"
      cy.get('#createCard').check();

      // Submit the form
      cy.get('.submit-btn button').click();

      // Verify form submission success (Adjust based on actual implementation)
      cy.visit('/account-management?id=1')
      cy.get('table tr').its('length').should('be.gt', initialRowCount);

    });
  });

  it('fills in and submits the form for a company account', () => {
    cy.get('table tr').its('length').then((initialRowCount) => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
      cy.get('#clientId').select('1: 1'); // Replace with a valid client ID

      // Choose account owner type
      cy.get('#accountOwnerType').select('COMPANY');

      // Wait for company list to load
      cy.get('select[name="selectedCompany"]').should('exist');

      cy.get('[class="loading-message"]').should('not.exist');
      // Select an existing company
      cy.get('select[name="selectedCompany"]').select('2: 3');

      // Select authorized personnel
      cy.get('#authorizedPersonnel').select('1: -1'); // Create new authorized personnel

      // Fill in authorized personnel details
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#dateOfBirth').type('1990-05-15');
      cy.get('#gender').select('M');
      cy.get('#email').type('johndoe@example.com');
      cy.get('#phoneNumber').type('1234567890');
      cy.get('#personnelAddress').type('123 Main St');

      // Select currency
      cy.get('#currency').select('USD');

      // Enter daily and monthly limits
      cy.get('#dailyLimit').type('10000');
      cy.get('#monthlyLimit').type('50000');

      // Check "Is Active"
      cy.get('#isActive').check();

      // Submit the form
      cy.get('.submit-btn button').click();

      // Verify form submission success
      cy.visit('/account-management?id=1')
      cy.get('table tr').its('length').should('be.gt', initialRowCount);

    });
  });

  it('validates required fields', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('.submit-btn button').should('be.disabled');
  });

  it('navigates to user registration when clicking "Create New User"', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('.create-user-link button').click();
    cy.url().should('include', '/register-user');
  });

  it('handles company selection correctly', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('#accountOwnerType').select('COMPANY');
    cy.get('#clientId').select('1: 1');

    // Ensure "Select Company" dropdown appears
    cy.get('select[name="selectedCompany"]').should('exist');

    // Select "Create New Company"
    cy.get('select[name="selectedCompany"]').select('1: -1');

    // Ensure fields for new company are enabled
    cy.get('#companyName').should('not.be.disabled');
    cy.get('#registrationNumber').should('not.be.disabled');
    cy.get('#taxNumber').should('not.be.disabled');
    cy.get('#activityCode').should('not.be.disabled');
    cy.get('#address').should('not.be.disabled');
  });

  it('handles authorized personnel selection correctly', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('#accountOwnerType').select('COMPANY');
    cy.get('#clientId').select('1: 1');
    cy.get('select[name="selectedCompany"]').select('2: 3'); // Replace with a valid company ID

    // Ensure "Authorized Personnel" dropdown exists
    cy.get('#authorizedPersonnel').should('exist');

    // Select "Create new authorized personnel"
    cy.get('#authorizedPersonnel').select('1: -1');

    // Ensure new personnel fields appear
    cy.get('#firstName').should('exist');
    cy.get('#lastName').should('exist');
    cy.get('#dateOfBirth').should('exist');
    cy.get('#email').should('exist');
  });

  it('validates email input for authorized personnel', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('#clientId').select('1: 1');
    cy.get('#accountOwnerType').select('COMPANY');
    cy.get('select[name="selectedCompany"]').select('2: 3'); // Replace with a valid company ID
    cy.get('#authorizedPersonnel').select('1: -1');

    cy.get('#email').type('invalid-email');
    cy.get('.submit-btn button').should('be.disabled');
  });

  // it('validates number inputs', () => {
  //   cy.get('[class="details-btn"] button').contains('New Account').click();
  //   cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
  //   cy.get('#dailyLimit').type('abc');
  //   cy.get('#dailyLimit').should('be.empty');
  //   cy.get('#dailyLimit').type('-100');
  //   cy.get('#dailyLimit').blur();
  //   cy.get('#dailyLimit').should('have.class','error');
  //   cy.get('#monthlyLimit').type('abc');
  //   cy.get('#monthlyLimit').should('be.empty');
  //   cy.get('#monthlyLimit').type('-100');
  //   cy.get('#monthlyLimit').blur();
  //   cy.get('#monthlyLimit').should('have.class','error');
  //
  //   cy.get('.submit-btn button').should('be.disabled');
  // });

  it('cancels account creation', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('[type="back-button"] > button').click()
    cy.url().should('not.include', '/create-account'); // Ensure it navigates away
  });
});
