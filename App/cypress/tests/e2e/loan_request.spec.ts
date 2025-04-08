describe('Loan Request Component', () => {
  beforeEach(() => {
    cy.loginAsClient();
    cy.get('.sidebar-link').contains('Loans').click();
    cy.get('app-button > button').contains('New Loan').click();
  });

  const ACCOUNT_ERROR_SELECTOR = '.error';

  function findAndSelectValidAccount(options: string | any[], index: number) {
    if (index >= options.length) {
      throw new Error(`No valid account found after checking ${options.length} options. Last error selector checked: ${ACCOUNT_ERROR_SELECTOR}`);
    }

    const optionElement = options[index];
    const optionValue = optionElement.value;
    const optionText = optionElement.text; // For logging

    if (!optionValue || optionElement.disabled) {
      cy.log(`Skipping disabled or placeholder option ${index + 1}: '${optionText}'`);
      return findAndSelectValidAccount(options, index + 1);
    }

    cy.log(`Attempting account option ${index + 1}/${options.length}: Value='${optionValue}', Text='${optionText}'`);

    cy.get('#accountNumber').select(optionValue);

    cy.wait(150);

    cy.get('body', { timeout: 1500 }).then($body => {
      const errorElement = $body.find(ACCOUNT_ERROR_SELECTOR);

      if (errorElement.length > 0 && errorElement.is(':visible')) {
        cy.log(`Error ('${ACCOUNT_ERROR_SELECTOR}') detected for account '${optionText}'. Trying next.`);
        findAndSelectValidAccount(options, index + 1);
      } else {
        cy.log(`Selected VALID account: '${optionText}' (Value: ${optionValue}) - No error detected.`);
        cy.wrap(optionValue).as('selectedAccountNumber');
      }
    });
  }


  it('submits a valid loan request using dynamic account selection, approves it, and verifies balance', () => {
    const loanAmount = 5000;
    const loanCurrency = 'RSD';
    const loanPurpose = 'Buying a dynamic test car'; // Unique purpose

    cy.get('#type').select('CASH');
    cy.get('#amount').type(loanAmount.toString());
    cy.get('#currencyCode').select(loanCurrency);
    cy.get('#monthlyIncome').type('3000');
    cy.get('#employmentStatus').select('PERMANENT');
    cy.get('#employmentDuration').type('24');
    cy.get('#repaymentPeriod').select('12');
    cy.get('#contactPhone').type('+381641234567');
    cy.get('#rate-type').select('FIXED');

    cy.get('#accountNumber option').then($options => {
      const availableOptions = $options.toArray(); // Get all option elements
      if (availableOptions.length <= 1) { // Check if there's more than just a placeholder
        throw new Error('Account dropdown has zero or only one (likely placeholder) option.');
      }
      findAndSelectValidAccount(availableOptions, 0); // Start checking from the first option
    });

    // --- Continue Filling Form ---
    cy.get('#purpose').type(loanPurpose);

    // Intercept POST and Submit
    cy.intercept('POST', '/api/loan-requests').as('submitLoan');
    cy.contains('button', 'Submit Request').click();
    cy.wait('@submitLoan').its('response.statusCode').should('be.oneOf', [200, 201, 204]);
    cy.log('Loan request submitted successfully by client.');

    // --- Logout Client ---
    cy.get('.dropdown-trigger').click(); // Use better selectors if possible
    cy.get('.dropdown-list > div > a').contains('Logout').click();

    // --- Employee Actions (Requires the dynamically selected account number) ---
    // Use the alias '@selectedAccountNumber' stored earlier
    cy.get('@selectedAccountNumber').then(selectedAccNum => {
      expect(selectedAccNum, 'Selected account number should exist').to.exist; // Sanity check alias
      const clientAccountNumber = selectedAccNum.toString(); // Ensure it's a string if needed

      cy.loginAsEmployee();
      cy.visit(`http://localhost:4200/account/${clientAccountNumber}`);

      cy.get('[style="justify-content: space-between; display: flex;"] > :nth-child(1) > :nth-child(6)').invoke('text').then((initialText) => {
        const currAmount = parseFloat(initialText.replace('Balance:', ' ').trim());

        cy.get('.sidebar-link').contains('Loans').click();

        cy.get(':nth-child(1) > .flex-col > :nth-child(2)').invoke('text').then((loanText) => {
          const addAmount = parseFloat(loanText.replace('Amount:', ' ').trim());
          cy.get(':nth-child(1) app-button > button').contains('Approve').click();

          cy.visit(`http://localhost:4200/account/${clientAccountNumber}`);

          cy.get('[style="justify-content: space-between; display: flex;"] > :nth-child(1) > :nth-child(6)').invoke('text').then((finalText) => {
            const newBalance = parseFloat(finalText.replace('Balance:', '').trim());

            expect(newBalance).to.eq(currAmount + addAmount);
          });
        });
      });
    }); // End of cy.get('@selectedAccountNumber').then()
  });
});
