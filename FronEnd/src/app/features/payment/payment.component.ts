import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../service/store.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  codesUsedInMonth: number = 0; // Para almacenar el número de códigos usados
  filteredCodes: { code: string, value: number, status: string }[] = []; // Para mostrar los códigos en la tabla
  
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  years: number[] = [];
  months: { value: string, name: string }[] = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' }
  ];

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.loadYears();
  }

  loadYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year);
    }
  }

  onMonthOrYearChange(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.fetchUsedCodes(this.selectedYear, this.selectedMonth);
    }
  }
  qrImage: string | undefined;

  fetchUsedCodes(year: number, month: string): void {
    this.storeService.getUsedCodes(year, month).subscribe(
      (count: number) => { // El servicio devuelve un número
        this.codesUsedInMonth = count; // Cantidad de códigos usados
  
        // Generar un único código y sumar los valores
        if (count > 0) {
          const totalValue = count * 200; // Cada código tiene un valor de 200
          this.filteredCodes = [
            {
              code: `${count}`,  // Mostrar el total de códigos
              value: totalValue,                    // Valor total de todos los códigos
              status: 'rechazado'                   // Estado inicial "rechazado"
            }
          ];
        } else {
          this.filteredCodes = []; // Si no hay códigos, limpiar la tabla
        }
  
        console.log('Códigos generados:', this.filteredCodes);
      },
      (error) => {
        console.error('Error al obtener los códigos usados:', error);
      }
    );
  }
  
  
  
  saveFile(code: any): void {
    console.log('Guardando archivo para el código:', code);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.qrImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
