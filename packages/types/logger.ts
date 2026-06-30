import type { Role } from "./user";
import { LogAction } from "../config/logger";

export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type LogStatus = "SUCCESS" | "ERROR" | "WARNING" | "PENDING";
export type LogActionType = (typeof LogAction)[keyof typeof LogAction] | string;

export interface LogActor {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
}

export interface BaseLogInput {
  actor?: LogActor | null;
  action: LogActionType;
  message: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
}

export interface ErrorLogInput extends BaseLogInput {
  error?: unknown;
  level?: LogLevel;
}

export interface WarningLogInput extends BaseLogInput {
  level?: LogLevel;
}
