/**
 * Generează un friend code unic de forma #XXX
 * Unde X este o cifră de la 0-9
 */
export function generateFriendCode(): string {
  const digits = '0123456789';
  let code = '#';
  
  // Generează 3 cifre aleatorii
  for (let i = 0; i < 3; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return code;
}

/**
 * Generează un friend code unic de forma #XXXX
 * Unde X este o cifră de la 0-9
 */
export function generateLongFriendCode(): string {
  const digits = '0123456789';
  let code = '#';
  
  // Generează 4 cifre aleatorii
  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return code;
}

/**
 * Validează dacă un friend code este valid
 */
export function isValidFriendCode(code: string): boolean {
  const pattern = /^#[0-9]{3,4}$/;
  return pattern.test(code);
}
