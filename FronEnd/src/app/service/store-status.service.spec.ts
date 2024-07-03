import { TestBed } from '@angular/core/testing';

import { StoreStatusService } from './store-status.service';

describe('StoreStatusService', () => {
  let service: StoreStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
