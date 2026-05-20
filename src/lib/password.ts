import bcrypt from "bcryptjs";

export async function hashPassword(
  password: string
) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(
  password: string
) {
  const minLength =
    password.length >= 8;

  const uppercase =
    /[A-Z]/.test(password);

  const number =
    /[0-9]/.test(password);

  const symbol =
    /[^A-Za-z0-9]/.test(password);

  return {
    valid:
      minLength &&
      uppercase &&
      number &&
      symbol,

    errors: {
      minLength,
      uppercase,
      number,
      symbol,
    },
  };
}
