import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingListComponent } from './billing-list.component';

describe('BillingListComponent', () => {
  let component: BillingListComponent;
  let fixture: ComponentFixture<BillingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillingListComponent]
    });
    fixture = TestBed.createComponent(BillingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
