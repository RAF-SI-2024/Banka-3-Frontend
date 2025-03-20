import {ActivatedRoute, Router} from '@angular/router';
import { mount } from 'cypress/angular';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ClientPortalComponent} from '../../../../src/app/components/client-portal/client-portal.component';
import {ClientService} from '../../../../src/app/services/client.service';
import {AuthService} from '../../../../src/app/services/auth.service';
import {AlertService} from '../../../../src/app/services/alert.service';
import {HttpParams, provideHttpClient} from '@angular/common/http';
import {User} from '../../../../src/app/models/user.model';
import {
  MockActivatedRoute,
  MockAuthServiceAdmin,
  MockAuthServiceEmployee,
  MockClientService
} from '../../../support/mock';

describe('ClientPortalComponent Admin', () => {

  beforeEach(() => {
    // Mount the component with the mocked services
    mount(ClientPortalComponent, {
      providers: [
        provideHttpClient(),
        { provide: ClientService, useClass: MockClientService },
        { provide: AuthService, useClass: MockAuthServiceAdmin },
        { provide: AlertService, useValue: {showAlert: () => {console.log('alert')}} },
        { provide: Router },
        { provide: ActivatedRoute, useClass: MockActivatedRoute}
      ],
      componentProperties: {

      }
    });
  });

  it('should render the client portal title', () => {
    cy.get('h1').contains('Client Portal');
  });

  it('should display client information', () => {
    cy.get('.client-list .client-card').should('have.length.greaterThan', 1);
    cy.get('.client-info .client-name').should('contain', 'test');
    cy.get('.client-info .client-email').should('contain', 'test@test.com');
  });

  it('should have deleteUser button', () => {
    cy.get('app-button[label="Delete User"]').should('exist');
  });
  it('should have editUser button', () => {
    cy.get('app-button[label="Edit User"]').should('exist');
  });

  it('should have "List Accounts" button', () => {
    cy.get('app-button[label="List Accounts"]').should('exist');
  });

  it('should have "Register New User" button', () => {
    cy.get('app-button[label="Register New User"]').should('exist');
  });
});
describe('ClientPortalComponent Employee', () => {

  beforeEach(() => {
    // Mount the component with the mocked services
    mount(ClientPortalComponent, {
      providers: [
        provideHttpClient(),
        { provide: ClientService, useClass: MockClientService },
        { provide: AuthService, useClass: MockAuthServiceEmployee },
        { provide: AlertService, useValue: {showAlert: () => {console.log('alert')}} },
        { provide: Router },
        { provide: ActivatedRoute, useClass: MockActivatedRoute}
      ],
      componentProperties: {

      }
    });
  });

  it('should have deleteUser button', () => {
    cy.get('app-button[label="Delete User"]').should('not.exist');
  });
  it('should have editUser button', () => {
    cy.get('app-button[label="Edit User"]').should('exist');
  });

  it('should have "List Accounts" button', () => {
    cy.get('app-button[label="List Accounts"]').should('exist');
  });

  it('should have "Register New User" button', () => {
    cy.get('app-button[label="Register New User"]').should('exist');
  });
});
