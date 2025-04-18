export interface MakeOrderDto {
  listingId: number;
  orderType: string;
  quantity: number;
  contractSize: number;
  orderDirection: string;
  accountNumber: string;
}

enum OrderType{
  MARKET, LIMIT, STOP, STOP_LIMIT
}

enum OrderDirection{
  BUY, SELL
}
