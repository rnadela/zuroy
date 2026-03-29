-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "hours" TEXT,
    "photoUrls" TEXT[],
    "boosted" BOOLEAN NOT NULL DEFAULT false,
    "boostRegion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Partner_category_idx" ON "Partner"("category");

-- CreateIndex
CREATE INDEX "Partner_latitude_longitude_idx" ON "Partner"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Partner_boosted_idx" ON "Partner"("boosted");
