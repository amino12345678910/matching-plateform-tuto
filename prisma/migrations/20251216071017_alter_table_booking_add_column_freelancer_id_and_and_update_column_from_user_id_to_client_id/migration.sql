/*
  Warnings:

  - You are about to drop the column `userId` on the `booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceId,clientId]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `freelancerId` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."booking" DROP CONSTRAINT "booking_userId_fkey";

-- DropIndex
DROP INDEX "public"."booking_serviceId_userId_idx";

-- DropIndex
DROP INDEX "public"."booking_serviceId_userId_key";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "freelancerId" TEXT NOT NULL,
ADD COLUMN     "revisedCount" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "booking_serviceId_clientId_idx" ON "booking"("serviceId", "clientId");

-- CreateIndex
CREATE INDEX "booking_clientId_freelancerId_idx" ON "booking"("clientId", "freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_serviceId_clientId_key" ON "booking"("serviceId", "clientId");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "user"("id");

-- CreateIndex
CREATE INDEX "user_hasPassword_idx" ON "user"("hasPassword");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
