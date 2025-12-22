-- CreateEnum
CREATE TYPE "imageSources" AS ENUM ('GOOGLE', 'CLOUDINARY', 'NULL');

-- AlterTable
ALTER TABLE "seller" ADD COLUMN     "imageSource" "imageSources" NOT NULL DEFAULT 'NULL';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "imageSource" "imageSources" NOT NULL DEFAULT 'NULL';
