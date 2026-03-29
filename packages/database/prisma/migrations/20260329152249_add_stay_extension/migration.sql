-- CreateEnum
CREATE TYPE "StayExtensionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "StayExtension" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "newCheckOut" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "StayExtensionStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StayExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StayExtension_hotelId_status_idx" ON "StayExtension"("hotelId", "status");

-- CreateIndex
CREATE INDEX "StayExtension_reservationId_idx" ON "StayExtension"("reservationId");

-- AddForeignKey
ALTER TABLE "StayExtension" ADD CONSTRAINT "StayExtension_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayExtension" ADD CONSTRAINT "StayExtension_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
