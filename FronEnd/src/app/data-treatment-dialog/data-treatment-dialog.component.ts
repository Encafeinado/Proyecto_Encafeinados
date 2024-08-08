import { Component,ViewEncapsulation  } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-treatment-dialog',
  templateUrl: './data-treatment-dialog.component.html',
  styleUrls: ['./data-treatment-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DataTreatmentDialogComponent {
  constructor(public dialogRef: MatDialogRef<DataTreatmentDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
