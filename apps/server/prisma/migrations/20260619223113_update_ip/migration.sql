/*
  Warnings:

  - You are about to drop the column `banExpires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `banReason` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `banned` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `banned-ip` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "banExpires",
DROP COLUMN "banReason",
DROP COLUMN "banned";

-- DropTable
DROP TABLE "banned-ip";

-- CreateTable
CREATE TABLE "ip" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "violations" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ip" (
    "userId" TEXT NOT NULL,
    "ipId" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ip_pkey" PRIMARY KEY ("userId","ipId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_ip_key" ON "ip"("ip");

-- AddForeignKey
ALTER TABLE "user_ip" ADD CONSTRAINT "user_ip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ip" ADD CONSTRAINT "user_ip_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
