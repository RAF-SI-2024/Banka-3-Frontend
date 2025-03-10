export interface PaymentOverviewDto {
    id: number;
    senderName: string;
    amount: number;
    date: string;             
    status: string;           
    cardNumber?: string;      
  }
  