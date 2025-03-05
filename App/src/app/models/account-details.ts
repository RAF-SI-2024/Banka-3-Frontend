import {AccountType} from '../enums/account-type.enum';

export interface AccountDetails {

  accountNumber: string;
  AccountOwner: string;
  accountType: AccountType;
  availableBalance: number;
  reservedFunds: number;
  balance: number;
}
