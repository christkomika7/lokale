export function maskEmail(email: string) {
  return email.replace(/(.{2}).+(@.+)/, "$1••••$2");
}

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9) {
    const parts = cleaned.match(/(\d{2})(\d{3})(\d{2})(\d{2})/);

    if (!parts) return phone;

    return `+242 ${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]}`;
  }

  return phone;
}

export function parseUserAgent(ua: string) {
  const result = {
    browser: "Unknown",
    os: "Unknown",
    device: "Desktop",
  };

  if (ua.includes("Windows")) result.os = "Windows";
  else if (ua.includes("Linux")) result.os = "Linux";
  else if (ua.includes("Mac OS")) result.os = "macOS";
  else if (ua.includes("Android")) result.os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iOS")) result.os = "iOS";

  if (/Android|iPhone|iPad|Mobile/i.test(ua)) {
    result.device = "Mobile";
  }

  if (ua.includes("Edg/")) result.browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) result.browser = "Opera";
  else if (ua.includes("Firefox/")) result.browser = "Firefox";
  else if (
    ua.includes("Chrome/") &&
    !ua.includes("Edg/") &&
    !ua.includes("OPR")
  )
    result.browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome"))
    result.browser = "Safari";

  return result;
}

export function formatIp(ip: string) {
  if (!ip) return "Inconnue";

  if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
    return "Localhost (développement)";
  }

  return ip;
}
