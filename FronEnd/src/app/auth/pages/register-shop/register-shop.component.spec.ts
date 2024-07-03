import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterShopComponent } from './register-shop.component';

describe('RegisterShopComponent', () => {
  let component: RegisterShopComponent;
  let fixture: ComponentFixture<RegisterShopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterShopComponent]
    });
    fixture = TestBed.createComponent(RegisterShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
