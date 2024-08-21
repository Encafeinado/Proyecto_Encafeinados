import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-treatment-dialog',
  templateUrl: './data-treatment-dialog.component.html',
  styleUrls: ['./data-treatment-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DataTreatmentDialogComponent {

  showPdf: boolean = false;
  isPdfViewed: boolean = false;

  constructor(public dialogRef: MatDialogRef<DataTreatmentDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  showPdfDocument(): void {
    this.showPdf = true;
  }

  markAsViewed(): void {
    this.isPdfViewed = true;
  }
}
