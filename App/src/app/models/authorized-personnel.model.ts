export interface AuthorizedPersonnel {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyId: number;
}

export interface CreateAuthorizedPersonnel {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyId: number;
}
