import {AccountCreationComponent} from '../../../../src/app/components/account-creation/account-creation.component';
import {ClientService} from '../../../../src/app/services/client.service';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {MockActivatedRoute, MockAuthServiceEmployee, MockClientService} from '../../../support/mock';
import {AuthService} from '../../../../src/app/services/auth.service';

describe('Create New Account Form', () => {
  beforeEach(() => {
    cy.mount(AccountCreationComponent, {
      providers: [
        provideHttpClient(),
        {provide: ClientService, useClass: MockClientService},
        {provide: ActivatedRoute, useClass: MockActivatedRoute},
        {provide: AuthService, useClass: MockAuthServiceEmployee},
      ],
    });
  });

  it('should display the form title', () => {
    cy.contains('Create New').should('be.visible');
  });

  it('should display all required form fields', () => {
    cy.get('select#clientId').should('be.visible');
    cy.get('button.create-user-link').should('be.visible');
    cy.get('select#accountType').should('be.visible').and('be.disabled');
    cy.get('select#accountOwnerType').should('be.visible');
    cy.get('select#currency').should('be.visible').and('be.disabled');
    cy.get('input#dailyLimit').should('be.visible');
    cy.get('input#monthlyLimit').should('be.visible');
    cy.get('input#createCard').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('button.submit-btn').should('be.disabled');

    cy.get('select#clientId').select('0: 1');
    cy.get('input#dailyLimit').type('1000');
    cy.get('input#monthlyLimit').type('5000');

    cy.get('button.submit-btn').should('not.be.disabled');
  });

  it('should show company fields when Account Owner Type is COMPANY', () => {
    cy.get('select#accountOwnerType').select('COMPANY');
    cy.get('input#companyName').should('be.visible');
    cy.get('input#registrationNumber').should('be.visible');
  });

  it('should validate numeric inputs', () => {
    cy.get('input#dailyLimit').type('abc');
    cy.get('input#dailyLimit').should('have.value', '0');
    cy.get('input#dailyLimit').clear().type('1000').should('have.value', '1000');
  });
});
