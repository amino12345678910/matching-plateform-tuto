-- DropIndex
DROP INDEX "public"."review_clientId_idx";

-- CreateIndex
CREATE INDEX "review_clientId_serviceId_idx" ON "review"("clientId", "serviceId");
