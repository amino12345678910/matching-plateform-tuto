/*
  Warnings:

  - Added the required column `freelancerId` to the `service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service" ADD COLUMN     "freelancerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
