/*
  Warnings:

  - Added the required column `type` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('AUTOMATED', 'NORMAL', 'FILE');

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "linkedUrl" TEXT,
ADD COLUMN     "type" "MessageType" NOT NULL;
