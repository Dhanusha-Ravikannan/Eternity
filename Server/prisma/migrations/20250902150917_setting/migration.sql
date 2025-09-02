/*
  Warnings:

  - You are about to alter the column `given_gold` on the `settingwastage` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `settingwastage` MODIFY `given_gold` DOUBLE NULL;
