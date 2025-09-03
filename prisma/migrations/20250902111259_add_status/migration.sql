-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_id_fkey`;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
