-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_postId_fkey`;

-- DropIndex
DROP INDEX `comments_postId_fkey` ON `comments`;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_id_fkey` FOREIGN KEY (`id`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
