-- CreateEnum
CREATE TYPE "MessageFeedback" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "chat_conversations" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "feedback" "MessageFeedback";
