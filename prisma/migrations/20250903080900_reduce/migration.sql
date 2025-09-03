/*
  Warnings:

  - You are about to drop the column `avator` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `avator`,
    ADD COLUMN `avatar` VARCHAR(191) NULL;
