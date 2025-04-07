describe('Create Current Account Component', () => {
  beforeEach(() => {
    cy.loginAsEmployee(); // Implement this custom command based on your auth flow
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management?id=1');
    // cy.get('[class="details-btn"] button').contains('New Account').click();
    // cy.get('.flex > [ng-reflect-router-link="/create-current-account"] > button').contains('Checking Account').click();
  });

  it('should load the form with required fields', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-current-account"] > button').contains('Checking Account').click();
    cy.get('h2').should('contain', 'Create New Current Account');
    cy.get('#clientId').should('exist');
    cy.get('#accountOwnerType').should('exist');
    cy.get('#currency').should('have.value', 'RSD');
    cy.get('#accountType').should('have.value', 'CURRENT');
    cy.get('.submit-btn button').should('be.disabled');
  });

  describe('Personal Account Creation', () => {
    beforeEach(() => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-current-account"] > button').contains('Checking Account').click();
      cy.get('#clientId').select('1: 1');
      cy.get('#accountOwnerType').select('PERSONAL');
      cy.get('#name').type('Personal Account');
      cy.get('#dailyLimit').type('5000');
      cy.get('#monthlyLimit').type('20000');
    });

    it('should enable submit button when required fields are filled', () => {
      cy.get('.submit-btn button').should('not.be.disabled');
    });

    it('should successfully create a personal account', () => {
      cy.get('.submit-btn button').click();
      cy.url().should('include', '/success');
    });

    it('should open card modal when createCard is checked', () => {
      cy.get('#createCard').check();
      cy.get('.submit-btn button').click();
      cy.get('app-modal h2').should('contain', 'Create Card');
    });
  });

  describe('Company Account Creation', () => {
    beforeEach(() => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-current-account"] > button').contains('Checking Account').click();
      cy.get('#clientId').select('1: 1');
      cy.get('#accountOwnerType').select('COMPANY');
    });

    it('should show company selection fields', () => {
      cy.get('select[name="selectedCompany"]').should('exist');
      cy.get('#authorizedPersonnel').should('exist');
    });

    it('should allow selecting existing company', () => {
      cy.get('select[name="selectedCompany"]').select('2: 3');
    });

    it('should enable new company fields when "Create New Company" is selected', () => {
      cy.get('select[name="selectedCompany"]').select('1: -1');
      cy.get('#companyName').should('not.be.disabled');
      cy.get('#registrationNumber').should('not.be.disabled');
    });

    it('should create account with existing company', () => {
      cy.get('select[name="selectedCompany"]').select('2: 3');
      cy.get('#name').type('Company Account');
      cy.get('#dailyLimit').type('10000');
      cy.get('#monthlyLimit').type('50000');
      cy.get('.submit-btn button').click();
      cy.url().should('include', '/success');
    });

    it('should create new company and account', () => {
      cy.get('select[name="selectedCompany"]').select('1: -1');
      cy.get('#companyName').type('New Company');
      cy.get('#majorityOwner').type('Test123');
      cy.get('#registrationNumber').type('987654');
      cy.get('#taxNumber').type('123456789');
      cy.get('#activityCode').type('1234');
      cy.get('#address').type('123 Main St');
      cy.get('#name').type('New Company Account');
      cy.get('#dailyLimit').type('15000');
      cy.get('#monthlyLimit').type('75000');
      cy.get('.submit-btn button').click();
      cy.url().should('include', '/success');
    });

    it('should create new authorized personnel', () => {
      cy.get('select[name="selectedCompany"]').select('2: 3');
      cy.get('#authorizedPersonnel').select('1: -1');
      cy.get('#firstName').type('New');
      cy.get('#lastName').type('Personnel');
      cy.get('#dateOfBirth').type('1990-01-01');
      cy.get('#gender').select('M');
      cy.get('#email').type('new@example.com');
      cy.get('#phoneNumber').type('1234567890');
      cy.get('#personnelAddress').type('456 Oak St');
      cy.get('#name').type('Account With Personnel');
      cy.get('#dailyLimit').type('20000');
      cy.get('#monthlyLimit').type('100000');
      cy.get('.submit-btn button').click();
      cy.url().should('include', '/success');
    });
  });

  describe('Card Creation Modal', () => {
    beforeEach(() => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-current-account"] > button').contains('Checking Account').click();
      cy.get('#clientId').select('1: 1');
      cy.get('#name').type('Account With Card');
      cy.get('#dailyLimit').type('5000');
      cy.get('#monthlyLimit').type('20000');
      cy.get('#createCard').check();
      cy.get('.submit-btn button').click();
    });

    it('should create card when form is valid', () => {
      cy.get('app-modal select[name="type"]').select('DEBIT');
      cy.get('app-modal select[name="issuer"]').select('VISA');
      cy.get('app-modal input[name="name"]').type('My Card');
      cy.get('app-modal input[name="cardLimit"]').type('5000');
      cy.get('app-modal [type="submit"] button').click();
      cy.url().should('include', '/success');
    });
  });
});
