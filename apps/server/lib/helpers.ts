import { EmailAddress } from "../type/mailer";

export function formatAddress(
  addr: EmailAddress,
): string | { name: string; address: string } {
  if (typeof addr === "string") return addr;
  return { name: addr.name ?? "", address: addr.address };
}

export function formatAddresses(
  addr: EmailAddress | EmailAddress[] | undefined,
): (string | { name: string; address: string })[] | undefined {
  if (!addr) return undefined;
  const arr = Array.isArray(addr) ? addr : [addr];
  return arr.map(formatAddress);
}
