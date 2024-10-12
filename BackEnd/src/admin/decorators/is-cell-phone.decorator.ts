import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCellPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: any) {
    // Asegúrate de que el valor se convierte a cadena
    const phoneString = phone !== null && phone !== undefined ? phone.toString() : '';
    const cellPhoneRegex = /^[1-9]\d{9}$/; // Ajusta la expresión regular según el formato de números de celular de tu país
    return cellPhoneRegex.test(phoneString);
  }

  defaultMessage() {
    return 'El número de celular debe ser un número válido';
  }
}

export function IsCellPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCellPhoneConstraint,
    });
  };
}
