export interface Listing {
  id: number;
  ticker: string;
  name: string;
  exchange?: Exchange;
  lastRefresh: Date;
  price: number;
  ask: number;
}

export interface Exchange {
  mic: string;
  name: string;
  acronym: string;
  polity: string;
  currencyCode: string;
  timeZone: number;
}

export interface Stock extends Listing {
  outstandingShares: number;
  dividendYield: number;
}

export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export interface Option extends Listing {
  optionType: OptionType;
  strikePrice: number;
  impliedVolatility: number;
  openInterest: number;
  settlementDate: Date;
  underlyingStock: Stock;
}

export interface OptionPair {
  call: Option | null;
  put: Option | null;
  strikePrice: number;
}

export interface OptionChain {
  expirationDate: Date;
  daysToExpiry: number;
  stockPrice: number;
  optionPairs: OptionPair[];
}
