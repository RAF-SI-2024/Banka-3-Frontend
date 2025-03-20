import {AsideComponent} from '../../../../src/app/components/shared/aside/aside.component';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../../src/app/services/auth.service';
import {
  MockActivatedRoute,
  MockAuthServiceClient,
  MockAuthServiceEmployee
} from '../../../support/mock';

it('mounts', () => {
  cy.mount(AsideComponent, {
    providers: [provideHttpClient(),
      {provide: ActivatedRoute, useClass: MockActivatedRoute},
      {provide: AuthService, useClass: MockAuthServiceClient},
    ],
    componentProperties: {},
  })
})

describe('AsideComponent isEmployee', () => {
  beforeEach(() => {
    cy.mount(AsideComponent, {
      providers: [provideHttpClient(),
        {provide: ActivatedRoute, useClass: MockActivatedRoute},
        {provide: AuthService, useClass: MockAuthServiceEmployee},
      ],
      componentProperties: {
        isAuthenticated: true,
        isEmployee: true,
        isClient: false,
        isAdmin: true,
        isModalOpen: false,
        isSidebarOpen: true,
        isAccountModalOpen: false,
        userId: 1,
      },
    })

  })

  it('should show employee-specific links', () => {
    cy.get('.sidebar-list').should('contain', 'New Account');
  });

  it('should show default', () => {
    cy.get('.sidebar-list').should('contain', 'Client Portal');
    cy.get('.sidebar-list').should('contain', 'Accounts');
    cy.get('.sidebar-list').should('contain', 'Payments');
    cy.get('.sidebar-list').should('contain', 'Loans');
    cy.get('.sidebar-list').should('contain', 'Currency Exchange');
  })
})
