export interface Security {
  id: number;
  ticker: string;
  price: number;
  change: number;
  volume: number;
  initialMarginCost: number;
  maintenanceMargin: number;
  type: 'Stock' | 'Future' | 'Forex';
  settlementDate?: string;
}