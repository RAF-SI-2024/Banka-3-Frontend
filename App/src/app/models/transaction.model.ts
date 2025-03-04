export interface Transaction {
    id: number;
    date: Date;
    amount: number;
    type: 'inflow' | 'outflow';  
    description: string;         
  }
  