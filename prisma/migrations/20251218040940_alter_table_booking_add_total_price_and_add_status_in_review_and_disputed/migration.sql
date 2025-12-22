/*
  Warnings:

  - Added the required column `totalPrice` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "BookingStatus" ADD VALUE 'DISPUTED';

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;
