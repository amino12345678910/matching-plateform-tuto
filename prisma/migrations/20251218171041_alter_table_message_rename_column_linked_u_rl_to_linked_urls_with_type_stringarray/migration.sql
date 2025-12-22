/*
  Warnings:

  - You are about to drop the column `linkedUrl` on the `message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "message" DROP COLUMN "linkedUrl",
ADD COLUMN     "linkedUrls" TEXT[];
