/**
 * Generează un friend code unic de forma #XXXX
 * Unde X este o cifră de la 0-9
 * Acest cod va fi un ID unic pentru fiecare utilizator
 */
export function generateFriendCode(): string {
  const digits = '0123456789';
  let code = '#';
  
  // Generează 4 cifre aleatorii pentru mai multă unicitate
  for (let i = 0; i < 4; i++) {
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
 * Acum acceptă doar formatul #XXXX (4 cifre)
 */
export function isValidFriendCode(code: string): boolean {
  const pattern = /^#[0-9]{4}$/;
  return pattern.test(code);
}
