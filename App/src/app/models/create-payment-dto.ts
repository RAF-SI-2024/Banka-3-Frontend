export interface CreatePaymentDto {
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    paymentCode: string;
    purposeOfPayment: string;
    referenceNumber?: string;
  }
  