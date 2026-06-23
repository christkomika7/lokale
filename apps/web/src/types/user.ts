export enum Role {
  ADMIN = "ADMIN",
  WORKSPACE = "WORKSPACE",
  USER = "USER",
}

export enum Plan {
  FREE = "free",
  PRO = "pro",
  BUSINESS = "business",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
  PENDING = "pending",
}

export interface AdminUsers {
  id: string;
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
  idVerified: boolean;
  ips: string[];
  devices: string[];
  suspiciousActivity: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  plan: Plan;
  country: string;
  city: string;
  emailVerified: boolean;
  idVerified: boolean;
}
