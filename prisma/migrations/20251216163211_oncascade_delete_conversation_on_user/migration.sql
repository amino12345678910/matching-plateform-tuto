-- DropForeignKey
ALTER TABLE "public"."conversation" DROP CONSTRAINT "conversation_bookingId_fkey";

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
