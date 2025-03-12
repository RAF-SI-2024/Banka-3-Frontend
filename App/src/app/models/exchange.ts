import {Currency} from './currency.model';

export interface Exchange {
  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number;
  sellRate: number;
}
