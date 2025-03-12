import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoanRequestService } from '../../services/loan-request.service';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from '../alert/alert.component';
import { SuccessComponent } from '../success/success.component';
import { LoanRequest, LoanType, EmploymentStatus } from '../../models/loan-request.model';
import { Currency } from '../../models/currency.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, SuccessComponent],
  templateUrl: './loan-request.component.html',
  styleUrls: ['./loan-request.component.css']
})
export class LoanRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loanRequestService = inject(LoanRequestService);
  private accountService = inject(AccountService);
  private alertService = inject(AlertService);

  loanForm!: FormGroup;
  availableCurrencies: Currency[] = [];
  userAccounts: { accountNumber: string; currencyCode: string }[] = [];
  success: boolean = false;

  constructor() {
    this.loanForm = new FormGroup({});
  }

  loanTypes: LoanType[] = ['CASH', 'MORTGAGE', 'CAR', 'REFINANCING', 'STUDENT'];
  employmentStatuses: EmploymentStatus[] = ['PERMANENT', 'TEMPORARY', 'UNEMPLOYED'];

  repaymentOptions: { [key in LoanType]: number[] } = {
    CASH: [12, 24, 36, 48, 60, 72, 84],
    MORTGAGE: [60, 120, 180, 240, 300, 360],
    CAR: [12, 24, 36, 48, 60, 72, 84],
    REFINANCING: [12, 24, 36, 48, 60, 72, 84],
    STUDENT: [12, 24, 36, 48, 60, 72, 84]
  };

  get selectedLoanType(): LoanType | null {
    return this.loanForm.get('type')?.value as LoanType | null;
  }

  ngOnInit(): void {
    this.loanForm = this.fb.group({
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1000)]],
      currencyCode: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      monthlyIncome: ['', [Validators.required, Validators.min(1)]],
      employmentStatus: ['', Validators.required],
      employmentDuration: ['', [Validators.required, Validators.min(0)]],
      repaymentPeriod: [{ value: '', disabled: true }, Validators.required],
      contactPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      accountNumber: ['', [Validators.required, this.validateAccountCurrency.bind(this)]]
    });

    this.availableCurrencies = this.loanRequestService.getAvailableCurrencies();

    // mozda treba drugacije ja samo menjam da ne bi pucao run!
    this.accountService.getMyAccountsRegular().subscribe({
      next: (response) => {
        this.userAccounts = response.map(acc => ({
          accountNumber: acc.accountNumber,
          currencyCode: acc.currencyCode
        }));
      },
      error: () => {
        this.alertService.showAlert('error', 'Error fetching user accounts.');
      }
    });

    this.loanForm.get('type')?.valueChanges.subscribe(selectedType => {
      if (!selectedType) {
        this.loanForm.get('repaymentPeriod')?.reset();
        this.loanForm.get('repaymentPeriod')?.disable();
      } else {
        this.loanForm.get('repaymentPeriod')?.enable();
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.loanForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  resetInvalidField(controlName: string): void {
    const control = this.loanForm.get(controlName);
    if (control?.invalid && control?.touched) {
      control.setValue('');
      control.setErrors(control.errors);
    }
  }


  validateAccountCurrency(control: AbstractControl): ValidationErrors | null {
    const selectedAccount = this.userAccounts.find(acc => acc.accountNumber === control.value);
    const selectedCurrency = this.loanForm.get('currencyCode')?.value;

    if (selectedAccount && selectedAccount.currencyCode !== selectedCurrency) {
      return { invalidCurrency: true };
    }
    return null;
  }

  navigateToPage(route: string): void {
    this.router.navigate([route]);
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      const request: LoanRequest = this.loanForm.value;
      request.status = "PENDING"

      this.loanRequestService.submitLoanRequest(request).subscribe({
        next: () => {
          this.success = true;
          this.alertService.showAlert('success', 'Loan request submitted successfully!');
        },
        error: () => {
          this.alertService.showAlert('error', 'An error occurred while submitting the request.');
        }
      });
    } else {
      this.loanForm.markAllAsTouched();
    }
  }
}
