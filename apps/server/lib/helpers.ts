import { SORTABLE_FIELDS } from "@lokale/config/localisation";
import type { SortableField } from "@lokale/types/localisation";
import { Prisma } from "../generated/prisma/client";
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

export function serializeError(
  error: unknown,
): Prisma.InputJsonValue | undefined {
  if (error === undefined || error === null) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause !== undefined ? String(error.cause) : undefined,
    };
  }

  if (typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { raw: String(error) };
    }
  }

  return { raw: String(error) };
}

export function isSortable(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}
