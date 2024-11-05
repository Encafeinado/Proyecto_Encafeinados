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

  // Aquí puedes colocar el texto extraído del PDF
  pdfText: string = `Consentimiento para el Tratamiento de Datos Personales 
1. Introducción 
Encafeina2, comprometido con la protección de la privacidad de sus usuarios y cumpliendo 
con las disposiciones establecidas en la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la 
República de Colombia, solicita su autorización para el tratamiento de sus datos personales. 
2. Información Solicitada 
Para el registro de usuarios en nuestra plataforma, requerimos los siguientes datos: 
• Nombre 
• Apellidos 
• Correo Electrónico 
• Número de Celular 
Para el registro de tiendas, requerimos los siguientes datos: 
• Razón Social o Nombre 
• NIT 
• Correo Electrónico 
• Número de Celular 
• Dirección 
3. Finalidad del Tratamiento de Datos 
Los datos personales suministrados serán utilizados para las siguientes finalidades: 
• Verificar la identidad de los usuarios y tiendas registradas. 
• Facilitar  la  comunicación  entre  Encafeina2  y  sus  usuarios,  así  como  el  envío  de 
información relevante sobre nuestros servicios. 
• Realizar  encuestas  de  satisfacción  y  análisis  de  mercado  para  mejorar  nuestros 
servicios. 
• Enviar  promociones,  ofertas  y  otros  mensajes  publicitarios  relacionados  con  los 
productos y servicios de Encafeina2. 
• Cumplir con obligaciones legales y regulatorias aplicables. 
4. Derechos del Titular de los Datos 
Los titulares de los datos tienen derecho a: 
• Conocer, actualizar y rectificar sus datos personales. 
• Solicitar prueba de la autorización otorgada para el tratamiento de sus datos. 
• Ser informado sobre el uso que se ha dado a sus datos personales. 
• Presentar  quejas  ante  la  Superintendencia  de Industria  y  Comercio  (SIC)  por 
infracciones a las disposiciones de la ley de habeas data. 
• Revocar la autorización y/o solicitar la supresión de los datos cuando no se respeten 
los principios, derechos y garantías constitucionales y legales. 
5. Autorización 
Al  aceptar  los  términos  y  condiciones  de  este  documento,  usted  otorga  su  consentimiento 
expreso  e  informado  para  que  Encafeina2  trate  sus  datos  personales  de  acuerdo  con  las 
finalidades  aquí  establecidas.  El  uso  de  nuestra  plataforma  implica  la  aceptación  de  esta 
política de tratamiento de datos. 
Si no está de acuerdo con el tratamiento de sus datos personales bajo los términos descritos, 
le solicitamos que se abstenga de utilizar nuestra plataforma. 
6. Contacto 
Para  cualquier  consulta  o  solicitud  relacionada  con  el  tratamiento  de  sus datos  personales, 
puede  comunicarse  con  nosotros  a  través  del  correo  electrónico encafeinados4@gmail.com o al número de celular 3006292795. 
 
Importante:  Al  hacer  clic  en  "Aceptar"  o  al  continuar  con  el  proceso  de  registro,  usted 
declara que ha leído y  comprendido esta política de tratamiento de datos  personales y que 
otorga su consentimiento para el tratamiento de sus datos conforme a lo descrito..`;

  constructor(
    public dialogRef: MatDialogRef<DataTreatmentDialogComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  showPdfDocument(): void {
    this.showPdf = true;
    this.markAsViewed(); // Asegúrate de marcarlo como visto al mostrar el PDF
  }
  

  markAsViewed(): void {
    this.isPdfViewed = true;
  }
  
}
