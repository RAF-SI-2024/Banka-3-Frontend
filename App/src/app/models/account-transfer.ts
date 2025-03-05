export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AccountTransfer {
  accountNumber: string;
  clientId: number;
  companyId?: number | null;
  createdByEmployeeId: number;
  creationDate: string;
  expirationDate: string;
  currencyCode: string;
  status: string;
  balance: number;
  availableBalance: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailySpending: number;
  monthlySpending: number;
  ownershipType: string;
  accountCategory: string;
  owner: Owner;
}
