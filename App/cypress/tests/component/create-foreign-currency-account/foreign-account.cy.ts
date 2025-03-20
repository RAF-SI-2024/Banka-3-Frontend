import {
  CreateForeignCurrencyAccountComponent
} from '../../../../src/app/components/create-foreign-currency-account/create-foreign-currency-account.component';
import {provideHttpClient} from '@angular/common/http';
import {ClientService} from '../../../../src/app/services/client.service';
import {MockActivatedRoute, MockAuthServiceEmployee, MockClientService} from '../../../support/mock';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../../src/app/services/auth.service';

describe('Foreign Currency Account Form', () => {
  beforeEach(() => {
    cy.mount(CreateForeignCurrencyAccountComponent, {
      providers: [
        provideHttpClient(),
        {provide: ClientService, useClass: MockClientService},
        {provide: ActivatedRoute, useClass: MockActivatedRoute},
        {provide: AuthService, useClass: MockAuthServiceEmployee},
      ],
    });
  });

  it('should display all form elements', () => {
    cy.get('.container h2').should('contain', 'Create Foreign Currency Account');
    cy.get('#clientBtn').should('exist');
    cy.get('#businessBtn').should('exist');
    cy.get('#clientId').should('exist');
    cy.get('.employee-info').should('exist');
    cy.get('#dailyLimit').should('exist');
    cy.get('#monthlyLimit').should('exist');
    cy.get('#createCard').should('exist');
    cy.get('#currency').should('exist');
    cy.get('.submit-btn').should('exist');
  });

  it('should validate required fields', () => {
    cy.get('.submit-btn').should('be.disabled');
    cy.get('#clientId').select('1'); // Simulating user selection
    cy.get('#currency').select('USD');
    cy.get('#dailyLimit').type('500');
    cy.get('#monthlyLimit').type('5000');
    cy.get('.submit-btn').should('not.be.disabled');
  });

  it('should toggle between Client and Business account types', () => {
    cy.get('#clientBtn').click().should('have.class', 'active');
    cy.get('#businessBtn').click().should('have.class', 'active');
  });

  it('should display business fields when Business account is selected', () => {
    cy.get('#businessBtn').click();
    cy.get('#companyName').should('exist');
    cy.get('#companyRegistrationNumber').should('exist');
    cy.get('#taxIdentificationNumber').should('exist');
    cy.get('#companyActivityCode').should('exist');
    cy.get('#companyAddress').should('exist');
    cy.get('#majorityOwnerId').should('exist');
  });
});
