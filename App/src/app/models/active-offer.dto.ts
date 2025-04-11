export interface ActiveOfferDto {
    id: number;
    stockName: string;
    amount: number;
    pricePerUnit: number;
    settlementDate: string;
    status: string;
    lastModified?: string;
    postedBy?: string;
  }
  