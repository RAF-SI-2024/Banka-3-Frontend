describe('Loan Request Component', () => {
  beforeEach(() => {
    cy.loginAsClient();
    cy.get('.sidebar-link').contains('Loans').click();
    cy.get('app-button > button').contains('New Loan').click();
  });

  it('submits a valid loan request', () => {
    const accNumber = '333000197493096711'
    cy.get('#type').select('CASH');
    cy.get('#amount').type('5000');
    cy.get('#currencyCode').select('USD');
    cy.get('#monthlyIncome').type('3000');
    cy.get('#employmentStatus').select('PERMANENT');
    cy.get('#employmentDuration').type('24');
    cy.get('#repaymentPeriod').select('12');
    cy.get('#contactPhone').type('+381641234567');
    cy.get('#rate-type').select('FIXED');
    cy.get('#accountNumber').select(accNumber);
    cy.get('#purpose').type('Buying a car');

    cy.intercept('POST', '/api/loan-requests').as('submitLoan');

    cy.contains('Submit Request').click();

    cy.wait('@submitLoan').its('response.statusCode').should('be.ok');

    cy.get('.dropdown-trigger').click()
    cy.get('.dropdown-list > div > a').contains('Logout').click();
    cy.loginAsEmployee();
    cy.visit('http://localhost:4200/account/'+accNumber);

    cy.get('[style="justify-content: space-between; display: flex;"] > :nth-child(1) > :nth-child(6)').invoke('text').then((initialText) => {
      const currAmount = parseFloat(initialText.replace('Balance:', ' ').trim());

      cy.get('.sidebar-link').contains('Loans').click();

      cy.get(':nth-child(1) > .flex-col > :nth-child(2)').invoke('text').then((loanText) => {
        const addAmount = parseFloat(loanText.replace('Amount:', ' ').trim());
        cy.get(':nth-child(1) app-button > button').contains('Approve').click();

        cy.visit('http://localhost:4200/account/'+accNumber);

        cy.get('[style="justify-content: space-between; display: flex;"] > :nth-child(1) > :nth-child(6)').invoke('text').then((finalText) => {
          const newBalance = parseFloat(finalText.replace('Balance:', '').trim());

          expect(newBalance).to.eq(currAmount + addAmount);
        });
      });
    });
  });
});
