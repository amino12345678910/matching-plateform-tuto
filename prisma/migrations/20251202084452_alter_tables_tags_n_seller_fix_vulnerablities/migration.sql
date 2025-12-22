/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."tags_name_key";

-- AlterTable
ALTER TABLE "seller" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
