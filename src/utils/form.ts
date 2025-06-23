import {VALIDATION_MESSAGES} from '../constants';

const isPasswordStrong = (password: string): boolean => {
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUppercase && hasNumber && hasSymbol;
};

export const validateRegisterInput = (
  name: string,
  phone: string,
  password: string,
): {nameError: string; phoneError: string; passwordError: string} => {
  const errors = {
    nameError: '',
    phoneError: '',
    passwordError: '',
  };

  if (!name.trim()) {
    errors.nameError = VALIDATION_MESSAGES.nameRequired;
  }

  if (!phone.trim()) {
    errors.phoneError = VALIDATION_MESSAGES.phoneRequired;
  }

  if (phone.length < 10 || phone.length > 13) {
    errors.phoneError = VALIDATION_MESSAGES.phoneInvalidLength;
  }

  if (!password.trim()) {
    errors.passwordError = VALIDATION_MESSAGES.passwordRequired;
  } else if (!isPasswordStrong(password)) {
    errors.passwordError = VALIDATION_MESSAGES.passwordInvalid;
  }

  return errors;
};
