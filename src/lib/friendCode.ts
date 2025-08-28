const numbers = "0123456789";

export function generateFriendCode(length: number = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * numbers.length);
    code += numbers[index];
  }
  return code;
}


