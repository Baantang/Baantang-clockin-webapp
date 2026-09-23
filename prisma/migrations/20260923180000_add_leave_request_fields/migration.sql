-- AlterTable
ALTER TABLE "AbsenceRequest" ADD COLUMN     "decisionNote" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "leaveType" TEXT NOT NULL DEFAULT 'อื่นๆ';
