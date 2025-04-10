describe('Stocks Component', () => {
  beforeEach(() => {
    cy.loginAsClient();
    cy.get('.sidebar-link').contains('My Portfolio').click();
    cy.url().should('include', '/my-portfolio');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    cy.intercept('POST', 'http://localhost:8083/api/orders').as('submitOrder');
  });
  it('verifies portfolio table details', () => {
    cy.get('table thead tr').within(() => {
      cy.contains('Type');
      cy.contains('Ticker');
      cy.contains('Amount');
      cy.contains('Price');
      cy.contains('Profit');
      cy.contains('Last Modified');
      cy.contains('Public');
      cy.contains('Actions');
    });

    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(0).should('not.be.empty'); // Type
      cy.get('td').eq(1).should('not.be.empty'); // Ticker
      cy.get('td').eq(2).should('not.be.empty'); // Amount
      cy.get('td').eq(3).should('not.be.empty'); // Price
      cy.get('td').eq(4).invoke('text').should('match', /^\s*-?\d+(\.\d+)?\s*$/); // Profit
      cy.get('td').eq(5).should('not.be.empty'); // Last Modified

      cy.get('td.public-cell').within(() => {
        cy.get('.publish-button').should('exist');
      });

      cy.get('.sell-button button').should('exist');
    });
  });

  it('sell a stock, set limit and stop price', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('.sell-button button').click();
    });

    cy.get('#quantity').type('10');
    cy.get('#limitPrice').type('100');
    cy.get('#stopPrice').type('95');

    cy.get('app-button > button').contains('Review Order').click();
    cy.get('.confirmation-view').should('contain', 'Limit Price: $100.00');
    cy.get('.confirmation-view').should('contain', 'Stop Price: $95.00');
    cy.get('app-button > button').contains('Confirm').click();

    // cy.wait('@submitOrder').its('response.statusCode').should('eq', 200);
  });

  it('sell a stock, set limit and stop price, aon', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('.sell-button button').click();
    });

    cy.get('#quantity').type('5');
    cy.get('#limitPrice').type('105');
    cy.get('#stopPrice').type('100');
    cy.get('#allOrNone').check();

    cy.get('app-button > button').contains('Review Order').click();
    cy.get('.confirmation-view').should('contain', 'AON Stop-Limit Order');
    cy.get('app-button > button').contains('Confirm').click();

    // cy.wait('@submitOrder').its('response.statusCode').should('eq', 200);
  });

  it('sell a stock, set limit and stop price, margin', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('.sell-button button').click();
    });

    cy.get('#quantity').type('8');
    cy.get('#limitPrice').type('110');
    cy.get('#stopPrice').type('105');
    cy.get('#margin').check();

    cy.get('app-button > button').contains('Review Order').click();
    cy.get('.confirmation-view').should('contain', 'Margin Stop-Limit Order');
    cy.get('app-button > button').contains('Confirm').click();

    // cy.wait('@submitOrder').its('response.statusCode').should('eq', 200);
  });

  it('sell a stock, set limit and stop price, aon and margin', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('.sell-button button').click();
    });

    cy.get('#quantity').type('3');
    cy.get('#limitPrice').type('120');
    cy.get('#stopPrice').type('115');
    cy.get('#allOrNone').check();
    cy.get('#margin').check();

    cy.get('app-button > button').contains('Review Order').click();
    cy.get('.confirmation-view').should('contain', 'AON Margin Stop-Limit Order');
    cy.get('app-button > button').contains('Confirm').click();

    // cy.wait('@submitOrder').its('response.statusCode').should('eq', 200);
  });

});
