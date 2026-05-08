-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "backgroundColour" TEXT,
ADD COLUMN     "colorScheme" "ColorScheme" NOT NULL DEFAULT 'SYSTEM';
