/*
  Warnings:

  - You are about to drop the column `documentType` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `reviewDate` on the `documents` table. All the data in the column will be lost.
  - The `category` column on the `documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `classification` column on the `documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONSTITUTION', 'LAW', 'CODE', 'DECREE', 'RESOLUTION', 'REGULATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'RESTRICTED');

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "documentType",
DROP COLUMN "reviewDate",
DROP COLUMN "category",
ADD COLUMN     "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
DROP COLUMN "classification",
ADD COLUMN     "classification" "DocumentClassification" NOT NULL DEFAULT 'PUBLIC';
