-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "orders_trackingNumber_idx" ON "orders"("trackingNumber");
