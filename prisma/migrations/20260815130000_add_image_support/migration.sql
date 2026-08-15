-- AlterTable
ALTER TABLE "LineMessage" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT,
ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text',
ALTER COLUMN "text" DROP NOT NULL;
