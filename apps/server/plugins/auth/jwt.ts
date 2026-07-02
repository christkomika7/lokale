interface DecodedJWT {
  exp: number;
  email: string;
  iat?: number;
}

export function decodeJWTExpiry(token: string): DecodedJWT | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const padding = base64.length % 4;
    const base64Padded = padding ? base64 + "=".repeat(4 - padding) : base64;

    const jsonPayload = atob(base64Padded);

    const data = JSON.parse(jsonPayload);

    if (!data.exp || !data.email) {
      return null;
    }

    return {
      exp: Number(data.exp),
      email: String(data.email),
      iat: data.iat ? Number(data.iat) : undefined,
    };
  } catch (error) {
    return null;
  }
}
