-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "hotspotDataCapMb" INTEGER;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "hotspotDataUsedMb" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hotspotEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hotspotPassword" TEXT,
ADD COLUMN     "hotspotSsid" TEXT;
