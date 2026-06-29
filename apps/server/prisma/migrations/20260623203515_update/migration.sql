-- AlterTable
ALTER TABLE "user" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "idVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "suspiciousActivity" BOOLEAN NOT NULL DEFAULT false;
