export interface PaymentDetailsDto {
    id: number;
    senderName: string;
    amount: number;
    accountNumberReceiver: string;
    paymentCode: string;
    purposeOfPayment: string;
    referenceNumber?: string;
    date: string;             
    status: string;
    cardNumber?: string;
  }
  