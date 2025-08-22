export function generateFriendCode(): string {
  // Generează un cod de 4 cifre (0000-9999)
  const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `#${code}`;
}

export function validateFriendCode(code: string): boolean {
  // Validează formatul friend code-ului
  const regex = /^#[0-9]{4}$/;
  return regex.test(code);
}

export function sanitizeFriendCode(code: string): string {
  // Curăță și formatează friend code-ul
  return code.trim().replace(/^#?/, '#');
}
