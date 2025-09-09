import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintDashboard } from './complaint-dashboard';

describe('ComplaintDashboard', () => {
  let component: ComplaintDashboard;
  let fixture: ComponentFixture<ComplaintDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
