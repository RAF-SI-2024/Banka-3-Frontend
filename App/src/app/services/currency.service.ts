import { Injectable } from '@angular/core';
import {CurrencyDto} from '../models/currency-dto.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private mockCurrencies: CurrencyDto[] = [
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      countries: 'EU',
      description: 'Euro currency',
      active: true
    },
    {
      code: 'RSD',
      name: 'Dinar',
      symbol: 'RSD',
      countries: 'Serbia',
      description: 'Dinar currency',
      active: true
    },
    {
      code: 'CHF',
      name: 'Swiss Franc',
      symbol: 'CHF',
      countries: 'Switzerland',
      description: 'Swiss franc currency',
      active: true
    },
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      countries: 'United States',
      description: 'US Dollar currency',
      active: true
    },
    {
      code: 'JPY',
      name: 'Yen',
      symbol: '¥',
      countries: 'Japan',
      description: 'Yen currency',
      active: true
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '$',
      countries: 'Great Britain',
      description: 'British pound currency',
      active: true
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: '$',
      countries: 'Canada',
      description: 'Canadian Dollar currency',
      active: true
    },
    {
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: '$',
      countries: 'Australia',
      description: 'Australian Dollar currency',
      active: true
    }
  ];

  getCurrencies(): CurrencyDto[] {
    return this.mockCurrencies;
  }
}
