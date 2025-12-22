-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_roomId_senderId_idx" ON "message"("roomId", "senderId");

-- CreateIndex
CREATE INDEX "conversation_clientId_idx" ON "conversation"("clientId");

-- CreateIndex
CREATE INDEX "conversation_freelancerId_idx" ON "conversation"("freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_bookingId_key" ON "conversation"("bookingId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
