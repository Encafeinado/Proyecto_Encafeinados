import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  modalRef!: NgbModalRef;
  amount: number = 0;
  payments: any[] = [];
  yearDropdownOpen: boolean = false; // Estado para el dropdown del año
  monthDropdownOpen: boolean = false; // Estado para el dropdown del mes
  isSaving = false;
  shopData: any;
  submitted = false;
  userRole: string = '';
  userData: any;
  codesUsedInMonth: number = 0;
  filteredCodes: { code: string; value: number; status: string }[] = [];
  shopId: string = '';
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
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
  qrImage: string | undefined;

  @ViewChild('modalPayment', { static: true }) modalPayment: any;

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {} // Inyecta NgbModal

  ngOnInit(): void {
    this.loadYears();
    this.loadPayments();
    this.shopId = localStorage.getItem('shopId') || '';
    console.log(this.shopId);
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  toggleYearDropdown(): void {
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.monthDropdownOpen = false;
  }

  toggleMonthDropdown(): void {
    this.monthDropdownOpen = !this.monthDropdownOpen;
    this.yearDropdownOpen = false;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.yearDropdownOpen = false; // Cierra el dropdown al seleccionar un año
  }

  selectMonth(monthValue: string): void {
    this.selectedMonth = monthValue;
    this.monthDropdownOpen = false; // Cierra el dropdown al seleccionar un mes
  }

  isEndOfMonth(): boolean {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    return today.getDate() === lastDayOfMonth;
  }

  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const yearSelect = document.querySelector('.year-select');
    const monthSelect = document.querySelector('.month-select');

    // Verificamos si el dropdown del año está abierto y si el click fue fuera del selector
    if (this.yearDropdownOpen && yearSelect && !yearSelect.contains(target)) {
      this.yearDropdownOpen = false;
      this.checkAndFetchUsedCodes();
    }

    // Verificamos si el dropdown del mes está abierto y si el click fue fuera del selector
    if (
      this.monthDropdownOpen &&
      monthSelect &&
      !monthSelect.contains(target)
    ) {
      this.monthDropdownOpen = false;
      this.checkAndFetchUsedCodes();
    }
  }

  // Método auxiliar para verificar selección y hacer la llamada a fetchUsedCodes
  checkAndFetchUsedCodes(): void {
    if (this.selectedYear && this.selectedMonth && this.shopId) {
      this.fetchUsedCodes(this.shopId, this.selectedYear, this.selectedMonth);
    }
  }

  getSelectedMonthName(): string {
    const month = this.months.find((m) => m.value === this.selectedMonth);
    return month ? month.name : 'Seleccione un mes';
  }
  loadYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year);
    }
  }

  loadPayments(): void {
    const shopId = localStorage.getItem('shopId') || this.shopId;

    if (!shopId) {
      console.error('No se encontró el shopId.');
      return;
    }

    this.storeService.getAllPayments().subscribe(
      (data: any) => {
        // Filtra los pagos por shopId
        this.payments = data.filter(
          (payment: any) => payment.shopId === shopId
        );
        console.log(
          'Pagos cargados para el shopId',
          shopId,
          ':',
          this.payments
        );
      },
      (error) => {
        console.error('Error al cargar pagos:', error);
      }
    );
  }

  fetchUsedCodes(shopId: string, year: number, month: string): void {
    this.storeService.getUsedCodes(shopId, year, month).subscribe(
      (response) => {
        if (!response || !response.codeUsageDates) {
          console.error(
            'codeUsageDates es undefined o no existe en la respuesta'
          );
          this.codesUsedInMonth = 0;
          this.filteredCodes = [];
          return;
        }

        const filteredDates = response.codeUsageDates;
        this.codesUsedInMonth = filteredDates.length;

        if (this.codesUsedInMonth > 0) {
          const totalValue = this.codesUsedInMonth * 200;
          this.amount = totalValue;

          // Find payment for the specified year and month
          const paymentForMonth = this.payments.find(
            (payment) =>
              payment.year === year && payment.month === parseInt(month)
          );

          // Check the statusPayment field of the found payment, if it exists
          const statusPayment = paymentForMonth
            ? paymentForMonth.statusPayment
            : false;

          this.filteredCodes = [
            {
              code: `${this.codesUsedInMonth}`,
              value: totalValue,
              status: statusPayment ? 'Pagado' : 'Pendiente',
            },
          ];

          console.log(
            'Códigos usados en el mes y su estado:',
            this.filteredCodes
          );
        } else {
          this.filteredCodes = [];
        }
      },
      (error) => {
        console.error('Error al obtener los códigos usados:', error);
      }
    );
  }

  // Método para guardar el archivo y abrir el modal
  saveFile(code: any): void {
    // Establecer la variable 'submitted' en true cuando se intenta guardar
    this.submitted = true;

    // Validar si los campos requeridos (qrImage, selectedYear, selectedMonth) están presentes
    if (!this.qrImage || !this.selectedYear || !this.selectedMonth) {
      console.error('Faltan datos para guardar el pago');
      return;
    }

    // Si todos los campos son válidos, abre el modal de confirmación
    this.openConfirmationModal(this.modalPayment);
  }

  async confirmUpload(modal: any): Promise<void> {
    // Espera a que se carguen los datos del usuario
    await this.loadUserData();

    // Verifica los datos después de haberlos cargado
    if (!this.userRole || !this.shopData || !this.shopData.name) {
      console.error('Datos de la tienda no disponibles');
      modal.dismiss('cancel'); // Cierra el modal si no hay datos
      return;
    }

    const paymentData = {
      nameShop: this.shopData.name,
      shopId: this.shopId,
      amount: this.amount, // Asegúrate de asignar el valor correcto de 'amount'
      statusPayment: true,
      year: Number(this.selectedYear),
      month: Number(this.selectedMonth),
      images: [
        {
          image: this.qrImage,
        },
      ],
    };

    // Llamada al servicio para guardar el pago
    this.storeService.savePayment(paymentData).subscribe(
      (response) => {
        console.log('Pago guardado con éxito:', response);
        this.updatePaymentStatusToPaid(); // Actualiza el estado del pago aquí
        modal.close('uploaded'); // Cierra el modal después de la actualización
      },
      (error) => {
        console.error('Error al guardar el pago:', error);
        modal.dismiss('cancel'); // Cierra el modal en caso de error
      }
    );
  }

  updatePaymentStatusToPaid(): void {
    if (this.filteredCodes.length > 0) {
      this.filteredCodes[0].status = 'Pagado'; // Cambiar el estado del primer código a "Pagado"
      console.log(
        'Estado del pago actualizado a "Pagado":',
        this.filteredCodes
      );
    } else {
      console.error('No hay códigos para actualizar el estado');
    }
  }

  loadUserData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('Usuario no autenticado.');
        reject();
        return;
      }

      this.userRole = currentUser.roles ? currentUser.roles[0] : '';
      console.log('Rol del usuario:', this.userRole);

      if (this.userRole === 'shop') {
        this.loadShopData(currentUser._id)
          .then(() => {
            console.log('Datos de la tienda cargados');
            resolve();
          })
          .catch(reject); // Rechaza si hay un error al cargar la tienda
      } else {
        this.userData = currentUser;
        console.log('Datos del usuario:', this.userData);
        resolve();
      }
    });
  }

  loadShopData(shopId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storeService.getShopById(shopId).subscribe(
        (data) => {
          this.shopData = data; // Asegúrate de que data contenga la información correcta
          console.log('Datos de la tienda:', this.shopData); // Muestra los datos para verificar
          resolve();
        },
        (error) => {
          console.error('Error al cargar los datos de la tienda:', error);
          reject();
        }
      );
    });
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

  // Método para abrir el modal en el centro
  openConfirmationModal(modal: TemplateRef<any>): void {
    this.modalService.open(modal, { centered: true });
  }
}
