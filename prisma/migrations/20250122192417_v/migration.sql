-- CreateTable
CREATE TABLE "Secure" (
    "id" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Secure_pkey" PRIMARY KEY ("id")
);
