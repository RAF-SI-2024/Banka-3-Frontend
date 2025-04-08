describe('Create Current Account Component', () => {
  beforeEach(() => {
    cy.loginAsEmployee(); // Implement this custom command based on your auth flow
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management');
    // cy.get('[class="details-btn"] button').contains('New Account').click();
    // cy.get('app-account-management > app-modal > .modal-overlay > .modal-container > :nth-child(2) > .modal-content > .flex > :nth-child(1) > button').contains('Checking Account').click();
  });

  it('should load the form with required fields', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('app-account-management > app-modal > .modal-overlay > .modal-container > :nth-child(2) > .modal-content > .flex > :nth-child(1) > button').contains('Checking Account').click();
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
      cy.get('app-account-management > app-modal > .modal-overlay > .modal-container > :nth-child(2) > .modal-content > .flex > :nth-child(1) > button').contains('Checking Account').click();
      cy.wait(50)

      cy.get('#clientId option').then($options => {
        const validOptions = $options
          .filter((index, element) => {
            const $el = Cypress.$(element); // Wrap element in jQuery
            return $el.val() !== '' && !$el.prop('disabled');
          })
          .get();

        const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

        if (optionValuesToTry.length === 0) {
          throw new Error('Client select has no valid, non-empty, enabled options to test.');
        }

        const trySelectOption = (index: number) => {
          if (index >= optionValuesToTry.length) {
            throw new Error(`No option found in #clientId that avoids the '.error' element being visible after selection.`);
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`Attempting to select option with value: "${currentValue}" (index ${index})`);

          cy.get('#clientId').select(currentValue);

          cy.get('body').then($body => {
            if ($body.find('.error:visible').length > 0) {
              cy.log(`'.error' element is visible after selecting "${currentValue}". Trying next option.`);
              trySelectOption(index + 1);
            } else {
              cy.log(`Successfully selected option "${currentValue}" without triggering '.error'.`);
              cy.get('#clientId').should('have.value', currentValue);
            }
          });
        };

        trySelectOption(0);
      });
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
      cy.get('app-account-management > app-modal > .modal-overlay > .modal-container > :nth-child(2) > .modal-content > .flex > :nth-child(1) > button').contains('Checking Account').click();
      cy.get('#clientId option').then($options => {
        const validOptions = $options
          .filter((index, element) => {
            const $el = Cypress.$(element); // Wrap element in jQuery
            return $el.val() !== '' && !$el.prop('disabled');
          })
          .get();

        const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

        if (optionValuesToTry.length === 0) {
          throw new Error('Client select has no valid, non-empty, enabled options to test.');
        }

        const trySelectOption = (index: number) => {
          if (index >= optionValuesToTry.length) {
            throw new Error(`No option found in #clientId that avoids the '.error' element being visible after selection.`);
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`Attempting to select option with value: "${currentValue}" (index ${index})`);

          cy.get('#clientId').select(currentValue);

          cy.get('body').then($body => {
            if ($body.find('.error:visible').length > 0) {
              cy.log(`'.error' element is visible after selecting "${currentValue}". Trying next option.`);
              trySelectOption(index + 1);
            } else {
              cy.log(`Successfully selected option "${currentValue}" without triggering '.error'.`);
              cy.get('#clientId').should('have.value', currentValue);
            }
          });
        };

        trySelectOption(0);
      });
      cy.get('#accountOwnerType').select('COMPANY');
    });

    it('should show company selection fields', () => {
      cy.get('select[name="selectedCompany"]').should('exist');
      cy.get('#authorizedPersonnel').should('exist');
    });

    it('should enable new company fields when "Create New Company" is selected', () => {
      cy.get('select[name="selectedCompany"]').select('1: -1');
      cy.get('#companyName').should('not.be.disabled');
      cy.get('#registrationNumber').should('not.be.disabled');
    });

    describe('existing company', () => {
      beforeEach(function() { // MUST use function() here for 'this.skip()'
        cy.log('--- beforeEach: Attempting to select a valid company ---');
        // Use cy.wrap(null) to ensure the Cypress chain continues even if get fails early
        // although cy.get failure would typically fail the test anyway.
        cy.get('select[name="selectedCompany"] option').then($options => {
          // Filter options: Get only those that are potentially selectable
          const validOptions = $options
            .filter((index, element) => {
              const $el = Cypress.$(element);
              return $el.val() !== '' && !$el.prop('disabled');
            })
            .get(); // Convert jQuery object back to an array of DOM elements

          const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

          // --- Initial Check ---
          // If no valid options were found at all, skip the upcoming test.
          if (optionValuesToTry.length === 0) {
            cy.log('SKIPPING TEST (via beforeEach): No valid company options found.');
            this.skip(); // Skip the test associated with this beforeEach run
            // Note: skip() halts further execution in this context for this test
          }

          // --- Recursive Function Definition ---
          // Defined inside .then() so it has access to optionValuesToTry and 'this' context
          const trySelectOption = (index) => {
            // Base Case: If index is out of bounds, all options failed. Skip the test.
            if (index >= optionValuesToTry.length) {
              cy.log(`SKIPPING TEST (via beforeEach): All ${optionValuesToTry.length} valid options failed selection checks.`);
              this.skip(); // Skip the test associated with this beforeEach run
              return; // Stop this function's execution path
            }

            const currentValue = optionValuesToTry[index];
            cy.log(`(beforeEach) Attempting value: "${currentValue}" (Index ${index})`);
            cy.get('select[name="selectedCompany"]').select(currentValue);

            // Check the result asynchronously
            // Important: Ensure Cypress commands chain correctly
            cy.get('body', { log: false }).then($body => { // Use {log: false} to reduce noise if needed
              const errorVisible = $body.find('.error:visible').length > 0;
              const isDisallowedValue = currentValue === '1: -1'; // Use strict equality

              if (errorVisible || isDisallowedValue) {
                let reason = errorVisible ? "'.error' visible" : `value disallowed ('${currentValue}')`;
                cy.log(`(beforeEach) Condition failed for "${currentValue}": ${reason}. Trying next.`);
                // Recursive Call: Try the next option
                trySelectOption(index + 1);
              } else {
                // Success Case: Option selected without error.
                cy.log(`(beforeEach) Successfully selected "${currentValue}". Allowing test to run.`);
                // Verify selection (optional but good practice in beforeEach)
                cy.get('select[name="selectedCompany"]').should('have.value', currentValue);
                // Let the beforeEach hook complete successfully for this test
              }
            }); // End of cy.get('body').then()
          }; // End of trySelectOption definition

          // --- Initial Call ---
          // Start the recursive process only if options exist (initial check passed)
          // The check 'optionValuesToTry.length === 0' above already handles the skip
          // if no options were found, so we only call this if length > 0.
          if (optionValuesToTry.length > 0) {
            trySelectOption(0);
          }
          // Cypress implicitly waits for the command chain initiated here to complete
          // before moving to the 'it' block or skipping it if 'this.skip()' was called.

        }); // End of cy.get(...).then()
      }); // End of beforeEach
      it('should create account with existing company', () => {
        cy.get('#name').type('Company Account');
        cy.get('#dailyLimit').type('10000');
        cy.get('#monthlyLimit').type('50000');
        cy.get('.submit-btn button').click();
        cy.url().should('include', '/success');
      });

      it('should create new authorized personnel', () => {
        cy.get('#majorityOwner').type('Test123');
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
    })
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
      cy.get('#monthlyFee > .input-container > input').clear().type('1000')
      cy.get('#isActive').check();
      cy.get('app-button.submit-btn > .submit-btn').click();
    });
  });

  describe('Card Creation Modal', () => {
    beforeEach(() => {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('app-account-management > app-modal > .modal-overlay > .modal-container > :nth-child(2) > .modal-content > .flex > :nth-child(1) > button').contains('Checking Account').click();
      cy.get('#clientId option').then($options => {
        const validOptions = $options
          .filter((index, element) => {
            const $el = Cypress.$(element); // Wrap element in jQuery
            return $el.val() !== '' && !$el.prop('disabled');
          })
          .get();

        const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

        if (optionValuesToTry.length === 0) {
          throw new Error('Client select has no valid, non-empty, enabled options to test.');
        }

        const trySelectOption = (index: number) => {
          if (index >= optionValuesToTry.length) {
            throw new Error(`No option found in #clientId that avoids the '.error' element being visible after selection.`);
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`Attempting to select option with value: "${currentValue}" (index ${index})`);

          cy.get('#clientId').select(currentValue);

          cy.get('body').then($body => {
            if ($body.find('.error:visible').length > 0) {
              cy.log(`'.error' element is visible after selecting "${currentValue}". Trying next option.`);
              trySelectOption(index + 1);
            } else {
              cy.log(`Successfully selected option "${currentValue}" without triggering '.error'.`);
              cy.get('#clientId').should('have.value', currentValue);
            }
          });
        };

        trySelectOption(0);
      });
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
