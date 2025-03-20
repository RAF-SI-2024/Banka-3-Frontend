import { TestBed } from '@angular/core/testing';

import { AuthorizedPersonnelService } from './authorized-personnel.service';

describe('AuthorizedPersonnelService', () => {
  let service: AuthorizedPersonnelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorizedPersonnelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
