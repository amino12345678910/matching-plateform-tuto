/*
  Warnings:

  - The values [IN_REVIEW] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');
ALTER TABLE "public"."booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "ServicePackage" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0;
