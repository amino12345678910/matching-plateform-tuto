/*
  Warnings:

  - Added the required column `sellerId` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "sellerId" TEXT NOT NULL;
