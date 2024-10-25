import { Component } from '@angular/core'; 
import { StoreService } from 'src/app/service/store.service';

@Component({
  selector: 'app-billing-list',
  templateUrl: './billing-list.component.html',
  styleUrls: ['./billing-list.component.css'],
})
export class BillingListComponent {
  
  codesUsedInMonth: number = 0;
  filteredCodes: { code: string; value: number; status: string }[] = [];
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  shopId: string = '';
  years: number[] = [];
  months: { value: string; name: string }[] = [
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
    { value: '12', name: 'Diciembre' },
  ];
  stores: any[] = [];
  payments: any[] = [];
  filteredPayments: any[] = [];
  selectedPaymentImage: string | null = null;
  // Propiedades para paginación
  page: number = 1;
  pageSize: number = 5;
  totalPayments: number = 0;
  totalPages: number = 0;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadStores();
    this.loadPayments();
  }

  loadYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year);
    }
  }

  loadStores(): void {
    this.storeService.getAllShops().subscribe(
      (data: any) => {
        this.stores = data;
        console.log('Tiendas cargadas:', data);
      },
      (error) => {
        console.error('Error al cargar tiendas:', error);
      }
    );
  }

  loadPayments(): void {
    this.storeService.getAllPayments().subscribe(
      (data: any) => {
        this.payments = data;
        this.filteredPayments = this.payments;
        this.totalPayments = this.filteredPayments.length;
        this.calculateTotalPages();
        console.log('Pagos cargados:', data);
      },
      (error) => {
        console.error('Error al cargar pagos:', error);
      }
    );
  }

  onFilterChange(): void {
    this.filterPayments();
  }

  onStoreSelected(event: any): void {
    this.shopId = event.target.value;
    console.log('Tienda seleccionada:', this.shopId);
    this.onFilterChange();
  }

  filterPayments(): void {
    console.log('Filtrando pagos con:', {
      storeId: this.shopId,
      year: this.selectedYear,
      month: this.selectedMonth,
    });

    this.filteredPayments = this.payments.filter((payment) => {
      const yearMatches = !this.selectedYear || payment.year === this.selectedYear;
      const monthMatches = !this.selectedMonth || payment.month === parseInt(this.selectedMonth, 10);
      const shopMatches = !this.shopId || payment.shopId === this.shopId;

      return yearMatches && monthMatches && shopMatches;
    });

    console.log('Pagos filtrados:', this.filteredPayments);
    this.totalPayments = this.filteredPayments.length;
    this.calculateTotalPages();
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalPayments / this.pageSize);
  }

  getPaginatedPayments(): any[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
  }

  setPage(page: number) {
    this.page = page;
  }

  viewDetails(payment: any) {
    if (payment.images && payment.images.length > 0) {
      this.selectedPaymentImage = payment.images[0].image; // Asigna la imagen en formato base64
    } else {
      this.selectedPaymentImage = null;
      console.error("No hay imagen disponible para este registro");
    }
  }

  closeModal() {
    this.selectedPaymentImage = null; // Oculta el modal
  }
}
