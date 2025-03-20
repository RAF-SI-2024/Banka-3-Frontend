import {EditUserComponent} from '../../../../src/app/components/edit-user/edit-user.component';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {MockActivatedRoute, MockAuthServiceAdmin} from '../../../support/mock';
import {AuthService} from '../../../../src/app/services/auth.service';

const formatDate = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

describe('Edit User Form', () => {
  let mockUser = {
      id: 1,
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      gender: 'M',
      birthDate: new Date(),
      jmbg: '123123123',
      phone: '066666666',
      address: 'test',
    }

    beforeEach(() => {
    let mockForm: FormGroup;
    const fb = new FormBuilder();
    mockForm = fb.group({
      firstName: [{ value: mockUser.firstName, disabled: true }, Validators.required],
      lastName: [mockUser.lastName, [Validators.required, Validators.minLength(2)]],
      birthDate: [{ value: formatDate(mockUser.birthDate), disabled: true }, Validators.required],
      gender: [ mockUser.gender , Validators.required],
      email: [{ value: mockUser.email, disabled: true }, [Validators.required, Validators.email]],
      phone: [mockUser.phone, [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: [mockUser.address, [Validators.required, Validators.minLength(5)]],
    });
    cy.mount(EditUserComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        {provide: ActivatedRoute, useClass: MockActivatedRoute},
        {provide: AuthService, useClass: MockAuthServiceAdmin},
      ],
      componentProperties: {
        userForm: mockForm,
      }
    });
  });

  it('should display the form title', () => {
    cy.contains('Edit User').should('be.visible');
  });

  it('should show loading message when loading', () => {
    cy.get('.loading').should('be.visible');
  });

  it('should display all required form fields', () => {
    cy.get('input[formControlName="firstName"]').should('be.visible').and('be.disabled');
    cy.get('input[formControlName="lastName"]').should('be.visible');
    cy.get('input[formControlName="birthDate"]').should('be.visible').and('be.disabled');
    cy.get('select[formControlName="gender"]').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible').and('be.disabled');
    cy.get('input[formControlName="phone"]').should('be.visible');
    cy.get('input[formControlName="address"]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('input[formControlName="lastName"]').clear();
    cy.get('.field-error').contains('Required.').should('be.visible');

    cy.get('input[formControlName="phone"]').clear();
    cy.get('.field-error').contains('Required.').should('be.visible');

    cy.get('input[formControlName="address"]').clear();
    cy.get('.field-error').contains('Required.').should('be.visible');
  });

  it('should validate minimum length for last name', () => {
    cy.get('input[formControlName="lastName"]').clear().type('A');
    cy.get('.field-error').contains('At least 2 characters.').should('be.visible');
  });

  it('should validate phone number format', () => {
    cy.get('input[formControlName="phone"]').clear().type('invalid-phone');
    cy.get('.field-error').contains('Invalid phone format.').should('be.visible');
  });

  it('should enable save button when form is valid', () => {
    cy.get('input[formControlName="lastName"]').clear().type('Smith');
    cy.get('input[formControlName="phone"]').clear().type('1234567890');
    cy.get('input[formControlName="address"]').clear().type('123 Street');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});
