export type BusinessStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
export type CertificationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface Business {
  id: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo: string | null;
  cover: string | null;
  sector: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  status: BusinessStatus;
  verified: boolean;
  verifiedAt: string | null;
  certificationStatus: CertificationStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { publications: number; actions: number };
}

export type BusinessSchemaType = {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  sector?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
};
