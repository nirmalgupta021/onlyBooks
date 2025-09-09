import { TestBed } from '@angular/core/testing';

import { Complaint } from './complaint';

describe('Complaint', () => {
  let service: Complaint;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Complaint);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
