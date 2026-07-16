import type { Role } from "./user";
import { LogAction } from "../config/logger";

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

export interface ErrorLogInput<T> extends BaseLogInput {
  error?: unknown;
  level?: T;
}

export interface WarningLogInput<T> extends BaseLogInput {
  level?: T;
}
