import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTreatmentDialogComponent } from './data-treatment-dialog.component';

describe('DataTreatmentDialogComponent', () => {
  let component: DataTreatmentDialogComponent;
  let fixture: ComponentFixture<DataTreatmentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTreatmentDialogComponent]
    });
    fixture = TestBed.createComponent(DataTreatmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
