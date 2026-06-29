import type z from "zod";
import { userSchema } from "../lib/validator/user";

export enum Role {
  ADMIN = "ADMIN",
  WORKSPACE = "WORKSPACE",
  USER = "USER",
}

export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  PENDING = "PENDING",
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  status: UserStatus;
  plan: Plan;
  country: string;
  city: string;
  joinedAt: string;
  lastSeen: string;
  actions: number;
  emailVerified: boolean;
  ips: string[];
  devices: string[];
  suspiciousActivity: boolean;
}

export type UserSchemaType = z.infer<typeof userSchema>;
