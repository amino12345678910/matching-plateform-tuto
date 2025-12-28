/*
  Warnings:

  - You are about to drop the column `userId` on the `review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_userId_fkey";

-- DropIndex
DROP INDEX "public"."review_serviceId_idx";

-- DropIndex
DROP INDEX "public"."review_userId_idx";

-- DropIndex
DROP INDEX "public"."review_userId_key";

-- AlterTable
ALTER TABLE "review" DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "review_clientId_key" ON "review"("clientId");

-- CreateIndex
CREATE INDEX "review_clientId_idx" ON "review"("clientId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
