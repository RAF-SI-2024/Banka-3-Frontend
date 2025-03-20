export interface Company {
  id: number;
  name: string;
  registrationNumber: string;
  taxId: string;
  activityCode: string;
  address: string;
  // majorityOwner: number;
}

export interface CreateCompany {
  name: string;
  registrationNumber: string;
  taxId: string;
  activityCode: string;
  address: string;
  majorityOwner: number;
}
