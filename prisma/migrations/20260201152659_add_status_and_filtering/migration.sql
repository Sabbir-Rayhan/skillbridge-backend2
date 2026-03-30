-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'blocked');

-- AlterTable
ALTER TABLE "tutor_profiles" ADD COLUMN     "availability" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';
