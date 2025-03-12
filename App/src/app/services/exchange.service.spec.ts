import { TestBed } from '@angular/core/testing';

import { ExchangeService } from './exchange.service';

describe('ExchangeServiceService', () => {
  let service: ExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
