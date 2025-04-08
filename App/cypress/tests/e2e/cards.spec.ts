describe('Cards Component', () => {
  beforeEach(() => {
    cy.loginAsEmployee();
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management');
    cy.get('#view-cards button')
      .filter(':contains("View Cards")')
      .last()
      .click();
  });
  function createCard(number: number, retries = 5) {
    if (retries <= 0) {
      throw new Error("Max retries reached. Card creation did not succeed.");
    }

    cy.log(`Attempting card creation with number: ${number}`);

    cy.get('[label="Card Name"] input').clear().type(`Premium Credit Card ${number}`);
    cy.get('[label="Card Limit"] input').clear().type('100');

    // Click the "Create" button.
    cy.get('app-button > button').contains('Create').click();

    cy.wait(120)
    // Use cy.location() to check if the URL includes '/success'.
    cy.location('pathname', { timeout: 10000 }).then((pathname) => {
      if (pathname.includes('/success')) {
        cy.log(`Success page loaded with number ${number}. Clicking the success button.`);
        cy.get('app-button.success-button > .success-button').click();
      } else {
        cy.log(`URL did not update to success. Retrying with next number (${number + 1})...`);
        // Recursively try with the new number and one less allowed retry.
        createCard(number + 1, retries - 1);
      }
    });
  }
  it('should create card', () => {
    cy.get('table tr').then(($rows) => {
      cy.get('button').contains('Create New Card').click();
      createCard(1);
      const initialCount = $rows.find('td').length;
      cy.get('table tr td:contains("ACTIVE")')
        .should(($newActive) => {
          expect($newActive.length).to.be.greaterThan(initialCount);
        });
    })
  });
  it('should block a card when active cards exist', () => {
    // First check if any active cards exist
    cy.get('table tr').then(($rows) => {
      const activeCards = $rows.find('td:contains("ACTIVE")');

      if (activeCards.length === 0) {
        cy.log('no active');
        return;
      }

      const initialCount = activeCards.length;

      // Click the first Block Card button
      cy.get('button').contains('Block Card').first().click();

      // Verify count decreased
      cy.get('table tr td:contains("ACTIVE")')
        .should(($newActive) => {
          expect($newActive.length).to.be.lessThan(initialCount);
        });
    });
  });

  it('should block a card when blocked cards exist', () => {
    // First check if any active cards exist
    cy.get('table tr').then(($rows) => {
      const activeCards = $rows.find('td:contains("BLOCKED")');

      if (activeCards.length === 0) {
        cy.log('no blocked');
        return;
      }

      const initialCount = activeCards.length;

      // Click the first Block Card button
      cy.get('button').contains('Unblock Card').first().click();

      // Verify count decreased
      cy.get('table tr td:contains("BLOCKED")')
        .should(($newActive) => {
          expect($newActive.length).to.be.lessThan(initialCount);
        });
    });
  });
  it('should deactivate a card', () => {
    // First check if any active cards exist
    cy.get('table tr').then(($rows) => {
      const deactivatedCards = $rows.find('td:contains("DEACTIVATED")');
      const activeCards = $rows.find('td:contains("ACTIVE")');
      const blockedCards = $rows.find('td:contains("BLOCKED")');

      let initialCount = 0;
      if (activeCards.length === 0) {initialCount = activeCards.length}


      // Click the first Block Card button
      cy.get('button').contains('Deactivate Card').should('not.be.disabled').first().click();

      // Verify count decreased
      cy.get('table tr td:contains("DEACTIVATED")')
        .should(($newActive) => {
          expect($newActive.length).to.be.greaterThan(initialCount);
        });
    });
  });

});
