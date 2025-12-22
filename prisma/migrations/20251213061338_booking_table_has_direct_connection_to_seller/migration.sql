-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
