export interface AccountDto {
    accountNumber: string;
    type: string;
    accountCategory: string; 
    balance?: number;
    availableBalance?: number;
    owner?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }
  