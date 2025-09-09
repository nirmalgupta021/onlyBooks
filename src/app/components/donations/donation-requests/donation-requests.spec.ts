import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationRequests } from './donation-requests';

describe('DonationRequests', () => {
  let component: DonationRequests;
  let fixture: ComponentFixture<DonationRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
