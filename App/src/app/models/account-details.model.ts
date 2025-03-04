export interface AccountDetails {
    accountNumber: string;
    balance: number;
    availableBalance: number;
    dailyLimit: number;
    monthlyLimit: number;
    dailySpending: number;
    monthlySpending: number;
    status: string; 
    currencyCode: string;
    ownershipType: string;  
    accountCategory: string;  
    clientId: number;
    companyId?: number;
  
    owner?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }
  