export enum LoanType {
  CASH = 'CASH',
  MORTGAGE = 'MORTGAGE',
  AUTO = 'AUTO',
  REFINANCING = 'REFINANCING',
  STUDENT = 'STUDENT',
}

export enum LoanStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID_OFF = 'PAID_OFF',
  DELINQUENT = 'DELINQUENT',
}

export interface Loan {
  id?: number;
  loanNumber?: string;
  type?: LoanType;
  amount?: number;
  repaymentPeriod?: number;
  nominalInterestRate?: number;
  effectiveInterestRate?: number;
  startDate?: string;
  dueDate?: string;
  nextInstallmentAmount?: number;
  nextInstallmentDate?: string;
  remainingDebt?: number;
  currencyCode?: string;
  status?: LoanStatus;
}
