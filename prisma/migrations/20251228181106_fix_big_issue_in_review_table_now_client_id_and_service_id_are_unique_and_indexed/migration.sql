/*
  Warnings:

  - A unique constraint covering the columns `[clientId,serviceId]` on the table `review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."review_clientId_key";

-- DropIndex
DROP INDEX "public"."review_serviceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "review_clientId_serviceId_key" ON "review"("clientId", "serviceId");
