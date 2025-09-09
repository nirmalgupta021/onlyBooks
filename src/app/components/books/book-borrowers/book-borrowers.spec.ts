import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookBorrowers } from './book-borrowers';

describe('BookBorrowers', () => {
  let component: BookBorrowers;
  let fixture: ComponentFixture<BookBorrowers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookBorrowers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookBorrowers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
