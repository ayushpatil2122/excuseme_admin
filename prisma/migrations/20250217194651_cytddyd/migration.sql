/*
  Warnings:

  - You are about to drop the `OrdersHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OrdersHistory";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderHistoryId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bookMark" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "testRating" INTEGER,
    "quntityRating" INTEGER,
    "easyToUseRating" INTEGER,
    "accuracyRating" INTEGER,
    "comment" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_orderHistoryId_fkey" FOREIGN KEY ("orderHistoryId") REFERENCES "OrderHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
