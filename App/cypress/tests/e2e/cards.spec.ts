describe('Cards Component', () => {
  beforeEach(() => {
    cy.loginAsEmployee();
    cy.get(':nth-child(1) > .flex > :nth-child(1) > button').contains('List Accounts').click()
    cy.url().should('include', '/account-management?id=1');
    cy.get(':nth-child(1) app-button > button').contains('View Cards').click()
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
      const activeCards = $rows.find('td:contains("DEACTIVATED")');

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

  it('should create card', () => {
    cy.get('table tr').then(($rows) => {
      cy.get('button').contains('Create New Card').click();
      cy.get('[label="Card Name"]').type('Premium Credit Card 2');
      cy.get('[label="Card Limit"]').type('10000');

      cy.get('app-button > button').contains('Create').click();
      cy.url().should('include', '/success');
      cy.visit('/account-management?id=1');
      cy.get(':nth-child(1) app-button > button').contains('View Cards').click()
    })
  });
});
