export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface ClientDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
}

//Obzirom da vec postoji account model, svoj sam nazvao ovako i ako bi mozda trebao da se zove samo account
export interface AccountResponse {
  accountNumber: string;
  clientId: number;
  companyId: number;
  createdByEmployeeId: number;
  creationDate: string;
  expirationDate: string;
  currencyCode: string;
  status: AccountStatus;
  balance: number;
  availableBalance: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailySpending: number;
  monthlySpending: number;
  owner: ClientDto;
  ownershipType: string;
  accountCategory: string;
  name: string;
}
