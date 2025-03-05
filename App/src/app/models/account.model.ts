export interface Account {
    name: string;             
    number: string;           
    availableBalance: number; 
    
    currency: string;
    clientId: number;
    employeeId: number;
    companyId?: number;
    initialBalance: number;
    dailyLimit: number;
    monthlyLimit: number;
    dailySpending: number;
    monthlySpending: number;
    isActive: string;
    accountType: string;
    accountOwnerType: string;
    createCard: boolean;
}
