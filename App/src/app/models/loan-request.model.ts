export type LoanType = 'GOTOVINSKI' | 'STAMBENI' | 'AUTO' | 'REFINANSIRAJUCI' | 'STUDENTSKI';
export type EmploymentStatus = 'STALNO' | 'PRIVREMENO' | 'NEZAPOSLEN';
export type LoanRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LoanRequest {
  type: LoanType;
  amount: number;
  purpose: string;
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  employmentDuration: number;
  repaymentPeriod: number;
  contactPhone: string;
  accountNumber: string;
  currencyCode: string;
  status?: LoanRequestStatus;
}
