// validation.model.ts
export interface Validation {
  validate: (value: string) => boolean;
  message: string;
}

export const validations = {
  required: {
    validate: (value: string) => value.trim().length > 0,
    message: 'This field is required.',
  } as Validation,
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `Minimum length is ${min} characters.`,
  }) as Validation,
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `Maximum length is ${max} characters.`,
  }) as Validation,
  isEmail: {
    validate: (value: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    message: 'Enter a valid email address.',
  } as Validation,
  numeric: {
    validate: (value: string) => /^[0-9]+$/.test(value),
    message: 'Only numeric values are allowed.',
  } as Validation,
  alphabetic: {
    validate: (value: string) => /^[A-Za-z\s]+$/.test(value),
    message: 'Only alphabetic characters are allowed.',
  } as Validation,
  alphanumeric: {
    validate: (value: string) => /^[A-Za-z0-9]+$/.test(value),
    message: 'Only alphanumeric characters are allowed.',
  } as Validation,
  strongPassword: {
    validate: (value: string) =>
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    message: 'Password must be at least 8 characters long and contain both letters and numbers.',
  } as Validation,
  pattern: (regex: RegExp, errorMessage: string) => ({
    validate: (value: string) => regex.test(value),
    message: errorMessage,
  }) as Validation,
  minLengthWithoutSpaces: (minLength: number) => ({
    validate: (value: string) => {
      if (!value) return true;
      const trimmedLength = value.trim().length;
      return trimmedLength >= minLength;
    },
    message: `Minimum length without spaces is ${minLength} characters.`,
  }) as Validation,
  onlyLetters: () => ({
    validate: (value: string) => {
      if (!value) return true;
      const trimmedValue = value.trim();
      return /^[A-Za-z\s]+$/.test(trimmedValue);
    },
    message: 'Only letters and spaces are allowed.',
  }) as Validation,
  isValidJMBG: () => ({
    validate: (value: string) => {
      if (!value) return true;
      const trimmedValue = value.trim();
      return /^\d{13}$/.test(trimmedValue);
    },
    message: 'The number must be exactly 13 digits long.',
  }) as Validation,
  isValidPhone: () => ({
    validate: (value: string) => {
      if (!value) return true;
      const trimmedValue = value.trim();
      return /^0?[1-9][0-9]{6,14}$/.test(trimmedValue);
    },
    message: 'The number must be exactly 13 digits long.',
  }) as Validation,
  pastDate: () => ({
    validate: (value: string) => {
      const today = new Date();
      const inputDate = new Date(value);
      return inputDate < today;
    },
    message: 'The date must be in the past.',
  }) as Validation,
};
