import { AccountDto } from './account-dto.model';

export interface AccountPageDto {
  content: AccountDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
