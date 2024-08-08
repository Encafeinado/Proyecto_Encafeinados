import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingTiendaComponent } from './landing-tienda.component';

describe('LandingTiendaComponent', () => {
  let component: LandingTiendaComponent;
  let fixture: ComponentFixture<LandingTiendaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingTiendaComponent]
    });
    fixture = TestBed.createComponent(LandingTiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
