-- Add optional profile fields to Member (sqlite)
ALTER TABLE "Member" ADD COLUMN "address" TEXT;
ALTER TABLE "Member" ADD COLUMN "carBrand" TEXT;
ALTER TABLE "Member" ADD COLUMN "carModel" TEXT;
ALTER TABLE "Member" ADD COLUMN "carYear" INTEGER;
ALTER TABLE "Member" ADD COLUMN "carPlate" TEXT;
ALTER TABLE "Member" ADD COLUMN "preferences" JSON;

