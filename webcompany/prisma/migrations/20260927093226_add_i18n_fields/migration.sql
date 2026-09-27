-- AlterTable
ALTER TABLE "Project" ADD COLUMN "categoryEn" TEXT;
ALTER TABLE "Project" ADD COLUMN "categoryRu" TEXT;
ALTER TABLE "Project" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Project" ADD COLUMN "descriptionRu" TEXT;
ALTER TABLE "Project" ADD COLUMN "summaryEn" TEXT;
ALTER TABLE "Project" ADD COLUMN "summaryRu" TEXT;
ALTER TABLE "Project" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Project" ADD COLUMN "titleRu" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "descriptionRu" TEXT;
ALTER TABLE "Service" ADD COLUMN "summaryEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "summaryRu" TEXT;
ALTER TABLE "Service" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "titleRu" TEXT;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN "quoteEn" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "quoteRu" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "roleEn" TEXT;
ALTER TABLE "Testimonial" ADD COLUMN "roleRu" TEXT;
