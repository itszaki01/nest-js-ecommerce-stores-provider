// no-special-characters.validator.ts
import { ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'noSpecialCharacters', async: false })
export class NoSpecialCharactersConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    // Use a regex to check if the string contains only letters, numbers, and hyphens
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(value);
  }

  defaultMessage(): string {
    return 'إسم المتجر غير مقبول';
  }
}

export function NoSpecialCharacters(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoSpecialCharactersConstraint,
    });
  };
}
