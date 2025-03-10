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
import {AccountService} from '../../services/account.service';

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

  loanTypes: LoanType[] = ['GOTOVINSKI', 'STAMBENI', 'AUTO', 'REFINANSIRAJUCI', 'STUDENTSKI'];
  employmentStatuses: EmploymentStatus[] = ['STALNO', 'PRIVREMENO', 'NEZAPOSLEN'];

  repaymentOptions: { [key in LoanType]: number[] } = {
    GOTOVINSKI: [12, 24, 36, 48, 60, 72, 84],
    STAMBENI: [60, 120, 180, 240, 300, 360],
    AUTO: [12, 24, 36, 48, 60, 72, 84],
    REFINANSIRAJUCI: [12, 24, 36, 48, 60, 72, 84],
    STUDENTSKI: [12, 24, 36, 48, 60, 72, 84]
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
      accountNumber: ['', Validators.required]
    });

    this.availableCurrencies = this.loanRequestService.getAvailableCurrencies();

    this.accountService.getMyAccounts().subscribe({
      next: (response) => {
        this.userAccounts = response.content.map(acc => ({
          accountNumber: acc.accountNumber,
          currencyCode: acc.currencyCode
        }));
      },
      error: () => {
        this.alertService.showAlert('error', 'Greška pri učitavanju računa korisnika.');
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
    if (control?.invalid && control?.touched) {
      control.reset();
      return true;
    }
    return false;
  }



  onSubmit(): void {
    if (this.loanForm.valid) {
      const request: LoanRequest = this.loanForm.value;

      this.loanRequestService.submitLoanRequest(request).subscribe({
        next: () => {
          this.success = true;
          this.alertService.showAlert('success', 'Zahtev uspešno podnet!');
        },
        error: () => {
          this.alertService.showAlert('error', 'Došlo je do greške pri podnošenju zahteva.');
        }
      });
    } else {
      this.loanForm.markAllAsTouched();
    }
  }
}
