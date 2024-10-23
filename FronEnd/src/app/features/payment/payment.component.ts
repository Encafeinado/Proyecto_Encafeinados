import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Asegúrate de importar NgbModal

@Component({
  selector: 'app-facturacion',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  isSaving = false;
  shopData: any;
  userRole: string = '';
  userData: any;
  codesUsedInMonth: number = 0;
  filteredCodes: { code: string, value: number, status: string }[] = [];
  shopId: string = '';
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
  qrImage: string | undefined;

  @ViewChild('sesionModal') sesionModal!: TemplateRef<any>; // Agregada la referencia al modal

  constructor(private storeService: StoreService,
              private authService: AuthService,
              private modalService: NgbModal) {} // Inyecta NgbModal

  ngOnInit(): void {
    this.loadYears();
    this.shopId = localStorage.getItem('shopId') || '';
    console.log(this.shopId);
  }

  loadYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year);
    }
  }

  onMonthOrYearChange(): void {
    if (this.selectedYear && this.selectedMonth && this.shopId) {
      this.fetchUsedCodes(this.shopId, this.selectedYear, this.selectedMonth);
    }
  }

  fetchUsedCodes(shopId: string, year: number, month: string): void {
    this.storeService.getUsedCodes(shopId, year, month).subscribe(
      (count: number) => {
        this.codesUsedInMonth = count;

        if (count > 0) {
          const totalValue = count * 200; // Cada código tiene un valor de 200
          this.filteredCodes = [
            {
              code: `${count}`, // Mostrar el total de códigos
              value: totalValue, // Valor total de todos los códigos
              status: 'Pendiente' // Estado inicial "Pendiente"
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

 // Método para guardar el archivo y abrir el modal
saveFile(code: any): void {
  if (!this.qrImage || !this.selectedYear || !this.selectedMonth) {
    console.error('Faltan datos para guardar el pago');
    return;
  }

  // Abre el modal de confirmación
  this.openConfirmationModal(this.sesionModal);
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
    statusPayment: true,
    year: Number(this.selectedYear),
    month: Number(this.selectedMonth),
    images: [
      {
        image: this.qrImage
      }
    ]
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
      console.log('Estado del pago actualizado a "Pagado":', this.filteredCodes);
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
        this.loadShopData(currentUser._id).then(() => {
          console.log('Datos de la tienda cargados');
          resolve();
        }).catch(reject); // Rechaza si hay un error al cargar la tienda
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



  openConfirmationModal(modal: TemplateRef<any>): void {
    // Aquí se asume que utilizas algún servicio para abrir modales
    this.modalService.open(modal); // Asegúrate de que esta línea está correcta según tu implementación
  }
}
