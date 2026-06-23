export function maskEmail(email: string) {
  return email.replace(/(.{2}).+(@.+)/, "$1••••$2");
}
