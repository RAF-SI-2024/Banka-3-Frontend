import {EditEmployeeComponent} from '../../../../src/app/components/edit-employee/edit-employee.component';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {MockActivatedRoute, MockAuthServiceAdmin, MockAuthServiceEmployee} from '../../../support/mock';
import {AuthService} from '../../../../src/app/services/auth.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

describe('Edit Employee Form', () => {
  let mockEmployee ={
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    username: 'john',
    jmbg: '1234567890123',
    email: 'john.doe@example.com',
    birthDate: new Date(),
    gender: 'M',
    phone: '123456789',
    address: '123 Main St',
    position: 'Manager',
    department: 'HR',
    role: 'EMPLOYEE',
  }
  beforeEach(() => {
    let mockForm: FormGroup;
    const fb = new FormBuilder();
    mockForm = fb.group({
      firstName: [{ value: mockEmployee.firstName, disabled: true }, Validators.required],
      lastName: [mockEmployee.lastName, [Validators.required, Validators.minLength(2)]],
      birthDate: [{ value: mockEmployee.birthDate, disabled: true }, Validators.required],
      gender: [mockEmployee.gender, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      jmbg: [{ value: mockEmployee.jmbg, disabled: true }, Validators.required],
      email: [{ value: mockEmployee.email, disabled: true }, [Validators.required, Validators.email]],
      phone: [mockEmployee.phone, [Validators.required, Validators.pattern(/^0?[1-9][0-9]{6,14}$/)]],
      address: [mockEmployee.address, [Validators.required, Validators.minLength(5)]],
      position: [mockEmployee.position, [Validators.required]],
      department: [mockEmployee.department, [Validators.required]],
    });
    cy.mount(EditEmployeeComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        {provide: ActivatedRoute, useClass: MockActivatedRoute},
        {provide: AuthService, useClass: MockAuthServiceAdmin},
      ],
      componentProperties: {
        employee: mockEmployee,
        editForm: mockForm,
        loading: false,
      }
    });
  });

  it('should display all form fields', () => {
    cy.get('h2').contains('Edit Employee').should('be.visible');
    cy.get('input[formControlName="firstName"]').should('be.visible').should('be.disabled');
    cy.get('input[formControlName="lastName"]').should('be.visible');
    cy.get('input[formControlName="jmbg"]').should('be.visible').should('be.disabled');
    cy.get('input[formControlName="email"]').should('be.visible').should('be.disabled');
    cy.get('input[formControlName="birthDate"]').should('be.visible').should('be.disabled');
    cy.get('select[formControlName="gender"]').should('be.visible');
    cy.get('input[formControlName="phone"]').should('be.visible');
    cy.get('input[formControlName="address"]').should('be.visible');
    cy.get('input[formControlName="position"]').should('be.visible');
    cy.get('input[formControlName="department"]').should('be.visible');
    cy.get('app-button[type="submit"]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('input[formControlName="lastName"]').clear().blur();
    cy.get('input[formControlName="phone"]').clear().blur();
    cy.get('input[formControlName="address"]').clear().blur();
    cy.get('input[formControlName="position"]').clear().blur();
    cy.get('input[formControlName="department"]').clear().blur();

    cy.contains('This field is required').should('have.length', 5);
  });

  it('should submit form with valid data', () => {
    cy.get('input[formControlName="lastName"]').clear().type('Smith');
    cy.get('input[formControlName="phone"]').clear().type('987654321');
    cy.get('input[formControlName="address"]').clear().type('456 Elm St');
    cy.get('input[formControlName="position"]').clear().type('Developer');
    cy.get('input[formControlName="department"]').clear().type('IT');

    cy.get('app-button[type="submit"]').click();
  });

  it('should allow admin toggle', () => {
    cy.get('.admin-toggle button').click();
  });
});
