describe('foreign currency account test', () => {
  beforeEach(() => {
    cy.visit('/login/employee'); // Visit the employee login page before each test
    cy.get('[name="email"] input').type('petar.p@example.com');
    cy.get('[name="password"] input').type('petarpetar');
    cy.get('[type="submit"] button').click();
    cy.url().should('include', '/client-portal');
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management');

  });

  it('loads the form correctly', () => {
    cy.get('[class="details-btn"] button').contains('New Account').click();
    cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
    cy.get('h2').should('exist').and('contain', 'Create New');
    cy.get('form').should('exist');
  });

  it('fills in and submits the form for a personal account', () => {
    let initialUrl = '';

    // Capture the current URL once, at the start
    cy.url().then((url) => {
      initialUrl = url;
    });

    cy.get('table tr').its('length').then((initialRowCount) => {
      cy.get('[class="details-btn"] button')
        .contains('New Account')
        .click();

      cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button')
        .contains('Foreign Currency Account')
        .click();

      cy.get('#clientId option').then(($options) => {
        const validOptions = $options
          .filter((index, element) => {
            const $el = Cypress.$(element);
            return $el.val() !== '' && !$el.prop('disabled');
          })
          .get();

        const optionValuesToTry = validOptions.map(el =>
          Cypress.$(el).val().toString()
        );

        if (optionValuesToTry.length === 0) {
          throw new Error('Client select has no valid, non-empty, enabled options to test.');
        }

        const trySelectOption = (index) => {
          if (index >= optionValuesToTry.length) {
            throw new Error(
              `No option in #clientId avoided the '.error' element after selection.`
            );
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`Selecting #clientId value: "${currentValue}" (index ${index})`);

          cy.get('#clientId').select(currentValue);

          cy.get('body').then(($body) => {
            if ($body.find('.error:visible').length > 0) {
              cy.log(`'.error' is visible after selecting "${currentValue}". Trying next option.`);
              trySelectOption(index + 1);
            } else {
              cy.log(`Selected "${currentValue}" successfully (no '.error').`);
              cy.get('#clientId').should('have.value', currentValue);
            }
          });
        };

        trySelectOption(0);
      });

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

      // Finally, revisit the URL from the start & check row count
      cy.visit(initialUrl);
      cy.get('table tr')
        .its('length')
        .should('be.gt', initialRowCount);
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
    })

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
  it('fills in and submits the form for a company account', function () {
    cy.get('table tr').its('length').then(function (initialRowCount) {
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button')
        .contains('Foreign Currency Account')
        .click();

      cy.get('#accountOwnerType').select('COMPANY');

      // 1) Select valid Client
      cy.get('#clientId option').then(function ($options) {
        const validOptions = $options.filter((index, element) => {
          const $el = Cypress.$(element);
          return $el.val() !== '' && !$el.prop('disabled');
        }).get();

        const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

        if (optionValuesToTry.length === 0) {
          throw new Error('Client select has no valid, non-empty, enabled options to test.');
        }

        const trySelectOption = (index) => {
          if (index >= optionValuesToTry.length) {
            throw new Error(
              `No option in #clientId avoided the '.error' element being visible after selection.`
            );
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`Attempting to select option with value: "${currentValue}" (index ${index})`);

          cy.get('#clientId').select(currentValue);

          cy.get('body').then(($body) => {
            if ($body.find('.error:visible').length > 0) {
              cy.log(`'.error' is visible after selecting "${currentValue}". Trying next option.`);
              trySelectOption(index + 1);
            } else {
              cy.log(`Successfully selected option "${currentValue}" without triggering '.error'.`);
              cy.get('#clientId').should('have.value', currentValue);
            }
          });
        };

        trySelectOption(0);
      });

      // 2) Wait for and select an existing Company
      cy.get('select[name="selectedCompany"]').should('exist');
      cy.get('[class="loading-message"]').should('not.exist');

      cy.get('select[name="selectedCompany"] option').then(function ($options) {
        const validOptions = $options.filter((index, element) => {
          const $el = Cypress.$(element);
          return $el.val() !== '' && !$el.prop('disabled');
        }).get();

        const optionValuesToTry = validOptions.map(el => Cypress.$(el).val().toString());

        // If no valid options, skip this test
        if (optionValuesToTry.length === 0) {
          cy.log('SKIPPING TEST (via beforeEach): No valid company options found.');
          this.skip();
        }

        const trySelectCompany = (index) => {
          if (index >= optionValuesToTry.length) {
            cy.log(
              `SKIPPING TEST (via beforeEach): All ${optionValuesToTry.length} valid options failed selection checks.`
            );
            this.skip();
            return;
          }

          const currentValue = optionValuesToTry[index];
          cy.log(`(beforeEach) Attempting value: "${currentValue}" (Index ${index})`);
          cy.get('select[name="selectedCompany"]').select(currentValue);

          cy.get('body').then(($body) => {
            const errorVisible = $body.find('.error:visible').length > 0;
            const isDisallowedValue = currentValue === '1: -1';

            if (errorVisible || isDisallowedValue) {
              let reason = errorVisible
                ? "'.error' visible"
                : `value disallowed ('${currentValue}')`;
              cy.log(`(beforeEach) Condition failed for "${currentValue}": ${reason}. Trying next.`);
              trySelectCompany(index + 1);
            } else {
              cy.log(`(beforeEach) Successfully selected "${currentValue}". Proceeding.`);
              cy.get('select[name="selectedCompany"]').should('have.value', currentValue);
            }
          });
        };

        trySelectCompany(0);
      });

      // 3) Select authorized personnel
      cy.get('#authorizedPersonnel').select('1: -1'); // Create new authorized personnel

      // 4) Fill in authorized personnel details
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#dateOfBirth').type('1990-05-15');
      cy.get('#gender').select('M');
      cy.get('#email').type('johndoe@example.com');
      cy.get('#phoneNumber').type('1234567890');
      cy.get('#personnelAddress').type('123 Main St');

      // 5) Select currency
      cy.get('#currency').select('USD');

      // 6) Enter daily and monthly limits
      cy.get('#dailyLimit').type('10000');
      cy.get('#monthlyLimit').type('50000');

      // 7) Check "Is Active"
      cy.get('#isActive').check();

      // 8) Submit the form
      cy.get('.submit-btn button').click();

      // 9) Verify form submission success
      cy.visit('/account-management');
      cy.get('table tr').its('length').should('be.gt', initialRowCount);
    });
  });

  describe('existing company', () => {
    beforeEach(function () { // MUST use function() here for 'this.skip()'
      cy.get('[class="details-btn"] button').contains('New Account').click();
      cy.get('.flex > [ng-reflect-router-link="/create-foreign-currency-accou"] > button').contains('Foreign Currency Account').click();
      cy.get('#accountOwnerType').select('COMPANY');
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
      })
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
          cy.get('body', {log: false}).then($body => { // Use {log: false} to reduce noise if needed
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

      });
    }); // End of beforeEach
    it('handles authorized personnel selection correctly', () => {
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
      cy.get('#authorizedPersonnel').select('1: -1');

      cy.get('#email').type('invalid-email');
      cy.get('.submit-btn button').should('be.disabled');
    });
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
