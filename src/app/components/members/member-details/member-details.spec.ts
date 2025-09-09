import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDetails } from './member-details';

describe('MemberDetails', () => {
  let component: MemberDetails;
  let fixture: ComponentFixture<MemberDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
