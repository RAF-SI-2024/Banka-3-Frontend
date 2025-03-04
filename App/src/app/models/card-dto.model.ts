export interface CardDto {
    id: number;
    cardNumber: string;
    status: string;
    owner?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }
  