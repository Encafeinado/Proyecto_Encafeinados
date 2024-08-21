import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-data-treatment-dialog',
  templateUrl: './data-treatment-dialog.component.html',
  styleUrls: ['./data-treatment-dialog.component.css']
})
export class DataTreatmentDialogComponent {

  showPdf: boolean = false;
  isPdfViewed: boolean = false;
  pdfUrl: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<DataTreatmentDialogComponent>,
    private sanitizer: DomSanitizer
  ) {
    // Configura la URL del PDF a través del Google Docs Viewer
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://docs.google.com/viewer?url=' + encodeURIComponent('assets/pdf/Tratamiento-datos-personales-Encafeina2.pdf') + '&embedded=true'
    );
  }

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
