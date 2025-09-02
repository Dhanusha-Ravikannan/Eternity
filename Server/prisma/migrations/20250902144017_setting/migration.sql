/*
  Warnings:

  - You are about to drop the column `setting_entry_id` on the `settingwastage` table. All the data in the column will be lost.
  - You are about to drop the column `total_receipt` on the `settingwastage` table. All the data in the column will be lost.
  - Added the required column `total_stone_count` to the `SettingWastage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `settingwastage` DROP FOREIGN KEY `SettingWastage_setting_entry_id_fkey`;

-- DropIndex
DROP INDEX `SettingWastage_setting_entry_id_fkey` ON `settingwastage`;

-- AlterTable
ALTER TABLE `settingwastage` DROP COLUMN `setting_entry_id`,
    DROP COLUMN `total_receipt`,
    ADD COLUMN `setting_lot_id` INTEGER NULL,
    ADD COLUMN `setting_person_id` INTEGER NULL,
    ADD COLUMN `total_stone_count` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `SettingWastage` ADD CONSTRAINT `SettingWastage_setting_person_id_fkey` FOREIGN KEY (`setting_person_id`) REFERENCES `AddSetting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingWastage` ADD CONSTRAINT `SettingWastage_setting_lot_id_fkey` FOREIGN KEY (`setting_lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
