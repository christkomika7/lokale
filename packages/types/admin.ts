export type SessionDevice = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type AuditLog = {
  id: string;
  action: string;
  admin: string;
  target: string;
  ip: string;
  date: string;
  severity: "low" | "medium" | "high";
};
