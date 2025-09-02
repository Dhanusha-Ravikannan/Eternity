-- CreateTable
CREATE TABLE `AddCustomer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddCasting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddFiling` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddBuffing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddSupplierItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddPurchaseStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `item` ENUM('Gold', 'Silver') NOT NULL,
    `goldWeight` INTEGER NULL,
    `goldTouch` DOUBLE NULL,
    `goldPurity` DOUBLE NULL,
    `goldRate` DOUBLE NULL,
    `goldtotalValue` DOUBLE NULL,
    `silverWeight` INTEGER NULL,
    `silverTouch` DOUBLE NULL,
    `silverPurity` DOUBLE NULL,
    `silverRate` DOUBLE NULL,
    `silvertotalValue` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date` DATETIME(3) NOT NULL,
    `value` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `touch` DOUBLE NULL,
    `purity` DOUBLE NULL,
    `goldRate` DOUBLE NULL,
    `customerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddTouch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `touch` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CastingEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date` DATETIME(3) NOT NULL,
    `given_gold` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `purity` DOUBLE NOT NULL,
    `final_touch` DOUBLE NOT NULL,
    `pure_value` DOUBLE NOT NULL,
    `copper` DOUBLE NOT NULL,
    `final_weight` DOUBLE NOT NULL,
    `casting_customer_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CastingItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('Items', 'ScrapItems') NOT NULL,
    `item_id` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `item_purity` DOUBLE NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `casting_entry_id` INTEGER NOT NULL,
    `casting_customer_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CastiingTotalBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_item_weight` DOUBLE NOT NULL,
    `current_balance_weight` DOUBLE NOT NULL,
    `total_scrap_weight` DOUBLE NULL,
    `total_wastage` DOUBLE NOT NULL,
    `item_entry` INTEGER NOT NULL,

    UNIQUE INDEX `CastiingTotalBalance_item_entry_key`(`item_entry`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lotNumber` INTEGER NOT NULL,
    `filing_customer_id` INTEGER NULL,
    `setting_customer_id` INTEGER NULL,
    `buffing_customer_id` INTEGER NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilingEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `filing_person_id` INTEGER NOT NULL,
    `casting_item_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotFilingMapper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filing_id` INTEGER NOT NULL,
    `lot_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `filing_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilingItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `filing_entry_id` INTEGER NOT NULL,
    `type` ENUM('Items', 'ScrapItems') NOT NULL,
    `filing_item_id` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `item_purity` DOUBLE NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `stone_option` ENUM('WithStone', 'WithoutStone') NULL,
    `lot_filing_mapper_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilingTotalBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `after_weight` DOUBLE NULL,
    `total_product_weight` DOUBLE NOT NULL,
    `current_balance_weight` DOUBLE NOT NULL,
    `total_scrap_weight` DOUBLE NULL,
    `wastage` BOOLEAN NOT NULL,
    `balance` DOUBLE NOT NULL,
    `filing_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilingWastage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_receipt` DOUBLE NOT NULL,
    `total_wastage` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `wastage_percentage` INTEGER NOT NULL,
    `given_gold` DOUBLE NULL,
    `add_wastage` DOUBLE NULL,
    `overall_wastage` DOUBLE NOT NULL,
    `closing_balance` DOUBLE NOT NULL,
    `opening_balance` DOUBLE NOT NULL,
    `filing_person_id` INTEGER NULL,
    `filing_lot_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SettingEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `setting_person_id` INTEGER NOT NULL,
    `casting_item_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SettingItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('Items', 'ScrapItems') NULL,
    `setting_item_id` INTEGER NOT NULL,
    `scrap_weight` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `item_purity` DOUBLE NOT NULL,
    `scrap_remarks` VARCHAR(191) NULL,
    `setting_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotSettingMapper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `setting_id` INTEGER NOT NULL,
    `lot_id` INTEGER NOT NULL,
    `filing_item_id` INTEGER NULL,
    `setting_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SettingTotalBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receipt_weight` DOUBLE NOT NULL,
    `stone_count` DOUBLE NOT NULL,
    `stone_weight` DOUBLE NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `wastage` BOOLEAN NOT NULL,
    `total_product_weight` DOUBLE NOT NULL,
    `current_balance_weight` DOUBLE NOT NULL,
    `total_scrap_weight` DOUBLE NULL,
    `balance` DOUBLE NULL,
    `setting_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SettingWastage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_receipt` DOUBLE NOT NULL,
    `total_wastage` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `wastage_percentage` INTEGER NOT NULL,
    `given_gold` INTEGER NULL,
    `add_wastage` DOUBLE NULL,
    `overall_wastage` DOUBLE NOT NULL,
    `closing_balance` DOUBLE NOT NULL,
    `opening_balance` DOUBLE NOT NULL,
    `setting_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuffingEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `buffing_person_id` INTEGER NOT NULL,
    `casting_item_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuffingItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('Items', 'ScrapItems') NOT NULL,
    `buffing_item_id` INTEGER NOT NULL,
    `scrap_weight` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `item_purity` DOUBLE NOT NULL,
    `scrap_remarks` VARCHAR(191) NULL,
    `buffing_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuffingTotalBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receipt_weight` DOUBLE NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `wastage` BOOLEAN NOT NULL,
    `total_scrap_weight` DOUBLE NULL,
    `balance` DOUBLE NOT NULL,
    `buffing_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotBuffingMapper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buffing_id` INTEGER NOT NULL,
    `lot_id` INTEGER NOT NULL,
    `setting_item_id` INTEGER NULL,
    `filing_item_id` INTEGER NULL,
    `buffing_entry_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BuffingWastage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_receipt` DOUBLE NOT NULL,
    `total_wastage` DOUBLE NOT NULL,
    `balance` DOUBLE NOT NULL,
    `wastage_percentage` INTEGER NOT NULL,
    `given_gold` DOUBLE NULL,
    `add_wastage` DOUBLE NULL,
    `overall_wastage` DOUBLE NOT NULL,
    `closing_balance` DOUBLE NOT NULL,
    `opening_balance` DOUBLE NOT NULL,
    `buffing_person_id` INTEGER NULL,
    `buffing_lot_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `casting_item_id` INTEGER NULL,
    `filing_item_id` INTEGER NULL,
    `setting_item_id` INTEGER NULL,
    `buffing_item_id` INTEGER NULL,
    `item_id` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `touch_id` INTEGER NOT NULL,
    `item_purity` DOUBLE NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `casting_customer_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilingItemsToSettingEntry` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FilingItemsToSettingEntry_AB_unique`(`A`, `B`),
    INDEX `_FilingItemsToSettingEntry_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FilingItemsToFilingWastage` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FilingItemsToFilingWastage_AB_unique`(`A`, `B`),
    INDEX `_FilingItemsToFilingWastage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SettingItemsToSettingWastage` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SettingItemsToSettingWastage_AB_unique`(`A`, `B`),
    INDEX `_SettingItemsToSettingWastage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BuffingEntryToFilingItems` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BuffingEntryToFilingItems_AB_unique`(`A`, `B`),
    INDEX `_BuffingEntryToFilingItems_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BuffingEntryToSettingItems` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BuffingEntryToSettingItems_AB_unique`(`A`, `B`),
    INDEX `_BuffingEntryToSettingItems_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BuffingItemsToBuffingWastage` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BuffingItemsToBuffingWastage_AB_unique`(`A`, `B`),
    INDEX `_BuffingItemsToBuffingWastage_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomerTransaction` ADD CONSTRAINT `CustomerTransaction_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `AddCustomer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingEntry` ADD CONSTRAINT `CastingEntry_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingEntry` ADD CONSTRAINT `CastingEntry_casting_customer_id_fkey` FOREIGN KEY (`casting_customer_id`) REFERENCES `AddCasting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingItems` ADD CONSTRAINT `CastingItems_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingItems` ADD CONSTRAINT `CastingItems_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `AddItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingItems` ADD CONSTRAINT `CastingItems_casting_entry_id_fkey` FOREIGN KEY (`casting_entry_id`) REFERENCES `CastingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastingItems` ADD CONSTRAINT `CastingItems_casting_customer_id_fkey` FOREIGN KEY (`casting_customer_id`) REFERENCES `AddCasting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CastiingTotalBalance` ADD CONSTRAINT `CastiingTotalBalance_item_entry_fkey` FOREIGN KEY (`item_entry`) REFERENCES `CastingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotInfo` ADD CONSTRAINT `LotInfo_filing_customer_id_fkey` FOREIGN KEY (`filing_customer_id`) REFERENCES `AddFiling`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotInfo` ADD CONSTRAINT `LotInfo_setting_customer_id_fkey` FOREIGN KEY (`setting_customer_id`) REFERENCES `AddSetting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotInfo` ADD CONSTRAINT `LotInfo_buffing_customer_id_fkey` FOREIGN KEY (`buffing_customer_id`) REFERENCES `AddBuffing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingEntry` ADD CONSTRAINT `FilingEntry_filing_person_id_fkey` FOREIGN KEY (`filing_person_id`) REFERENCES `AddFiling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingEntry` ADD CONSTRAINT `FilingEntry_casting_item_id_fkey` FOREIGN KEY (`casting_item_id`) REFERENCES `CastingItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotFilingMapper` ADD CONSTRAINT `LotFilingMapper_filing_id_fkey` FOREIGN KEY (`filing_id`) REFERENCES `AddFiling`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotFilingMapper` ADD CONSTRAINT `LotFilingMapper_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotFilingMapper` ADD CONSTRAINT `LotFilingMapper_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `CastingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotFilingMapper` ADD CONSTRAINT `LotFilingMapper_filing_entry_id_fkey` FOREIGN KEY (`filing_entry_id`) REFERENCES `FilingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingItems` ADD CONSTRAINT `FilingItems_filing_entry_id_fkey` FOREIGN KEY (`filing_entry_id`) REFERENCES `FilingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingItems` ADD CONSTRAINT `FilingItems_filing_item_id_fkey` FOREIGN KEY (`filing_item_id`) REFERENCES `AddItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingItems` ADD CONSTRAINT `FilingItems_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingItems` ADD CONSTRAINT `FilingItems_lot_filing_mapper_id_fkey` FOREIGN KEY (`lot_filing_mapper_id`) REFERENCES `LotFilingMapper`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingTotalBalance` ADD CONSTRAINT `FilingTotalBalance_filing_entry_id_fkey` FOREIGN KEY (`filing_entry_id`) REFERENCES `FilingEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingWastage` ADD CONSTRAINT `FilingWastage_filing_person_id_fkey` FOREIGN KEY (`filing_person_id`) REFERENCES `AddFiling`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilingWastage` ADD CONSTRAINT `FilingWastage_filing_lot_id_fkey` FOREIGN KEY (`filing_lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingEntry` ADD CONSTRAINT `SettingEntry_setting_person_id_fkey` FOREIGN KEY (`setting_person_id`) REFERENCES `AddSetting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingEntry` ADD CONSTRAINT `SettingEntry_casting_item_id_fkey` FOREIGN KEY (`casting_item_id`) REFERENCES `CastingItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingItems` ADD CONSTRAINT `SettingItems_setting_item_id_fkey` FOREIGN KEY (`setting_item_id`) REFERENCES `AddItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingItems` ADD CONSTRAINT `SettingItems_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingItems` ADD CONSTRAINT `SettingItems_setting_entry_id_fkey` FOREIGN KEY (`setting_entry_id`) REFERENCES `SettingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotSettingMapper` ADD CONSTRAINT `LotSettingMapper_setting_id_fkey` FOREIGN KEY (`setting_id`) REFERENCES `AddSetting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotSettingMapper` ADD CONSTRAINT `LotSettingMapper_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotSettingMapper` ADD CONSTRAINT `LotSettingMapper_filing_item_id_fkey` FOREIGN KEY (`filing_item_id`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotSettingMapper` ADD CONSTRAINT `LotSettingMapper_setting_entry_id_fkey` FOREIGN KEY (`setting_entry_id`) REFERENCES `SettingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingTotalBalance` ADD CONSTRAINT `SettingTotalBalance_setting_entry_id_fkey` FOREIGN KEY (`setting_entry_id`) REFERENCES `SettingEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SettingWastage` ADD CONSTRAINT `SettingWastage_setting_entry_id_fkey` FOREIGN KEY (`setting_entry_id`) REFERENCES `SettingEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingEntry` ADD CONSTRAINT `BuffingEntry_buffing_person_id_fkey` FOREIGN KEY (`buffing_person_id`) REFERENCES `AddBuffing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingEntry` ADD CONSTRAINT `BuffingEntry_casting_item_id_fkey` FOREIGN KEY (`casting_item_id`) REFERENCES `CastingItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingItems` ADD CONSTRAINT `BuffingItems_buffing_item_id_fkey` FOREIGN KEY (`buffing_item_id`) REFERENCES `AddItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingItems` ADD CONSTRAINT `BuffingItems_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingItems` ADD CONSTRAINT `BuffingItems_buffing_entry_id_fkey` FOREIGN KEY (`buffing_entry_id`) REFERENCES `BuffingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingTotalBalance` ADD CONSTRAINT `BuffingTotalBalance_buffing_entry_id_fkey` FOREIGN KEY (`buffing_entry_id`) REFERENCES `BuffingEntry`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotBuffingMapper` ADD CONSTRAINT `LotBuffingMapper_buffing_id_fkey` FOREIGN KEY (`buffing_id`) REFERENCES `AddBuffing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotBuffingMapper` ADD CONSTRAINT `LotBuffingMapper_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotBuffingMapper` ADD CONSTRAINT `LotBuffingMapper_setting_item_id_fkey` FOREIGN KEY (`setting_item_id`) REFERENCES `SettingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotBuffingMapper` ADD CONSTRAINT `LotBuffingMapper_filing_item_id_fkey` FOREIGN KEY (`filing_item_id`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotBuffingMapper` ADD CONSTRAINT `LotBuffingMapper_buffing_entry_id_fkey` FOREIGN KEY (`buffing_entry_id`) REFERENCES `BuffingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingWastage` ADD CONSTRAINT `BuffingWastage_buffing_person_id_fkey` FOREIGN KEY (`buffing_person_id`) REFERENCES `AddBuffing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuffingWastage` ADD CONSTRAINT `BuffingWastage_buffing_lot_id_fkey` FOREIGN KEY (`buffing_lot_id`) REFERENCES `LotInfo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_casting_item_id_fkey` FOREIGN KEY (`casting_item_id`) REFERENCES `CastingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_filing_item_id_fkey` FOREIGN KEY (`filing_item_id`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_setting_item_id_fkey` FOREIGN KEY (`setting_item_id`) REFERENCES `SettingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_buffing_item_id_fkey` FOREIGN KEY (`buffing_item_id`) REFERENCES `BuffingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `AddItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_touch_id_fkey` FOREIGN KEY (`touch_id`) REFERENCES `AddTouch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_casting_customer_id_fkey` FOREIGN KEY (`casting_customer_id`) REFERENCES `AddCasting`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilingItemsToSettingEntry` ADD CONSTRAINT `_FilingItemsToSettingEntry_A_fkey` FOREIGN KEY (`A`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilingItemsToSettingEntry` ADD CONSTRAINT `_FilingItemsToSettingEntry_B_fkey` FOREIGN KEY (`B`) REFERENCES `SettingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilingItemsToFilingWastage` ADD CONSTRAINT `_FilingItemsToFilingWastage_A_fkey` FOREIGN KEY (`A`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilingItemsToFilingWastage` ADD CONSTRAINT `_FilingItemsToFilingWastage_B_fkey` FOREIGN KEY (`B`) REFERENCES `FilingWastage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SettingItemsToSettingWastage` ADD CONSTRAINT `_SettingItemsToSettingWastage_A_fkey` FOREIGN KEY (`A`) REFERENCES `SettingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SettingItemsToSettingWastage` ADD CONSTRAINT `_SettingItemsToSettingWastage_B_fkey` FOREIGN KEY (`B`) REFERENCES `SettingWastage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingEntryToFilingItems` ADD CONSTRAINT `_BuffingEntryToFilingItems_A_fkey` FOREIGN KEY (`A`) REFERENCES `BuffingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingEntryToFilingItems` ADD CONSTRAINT `_BuffingEntryToFilingItems_B_fkey` FOREIGN KEY (`B`) REFERENCES `FilingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingEntryToSettingItems` ADD CONSTRAINT `_BuffingEntryToSettingItems_A_fkey` FOREIGN KEY (`A`) REFERENCES `BuffingEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingEntryToSettingItems` ADD CONSTRAINT `_BuffingEntryToSettingItems_B_fkey` FOREIGN KEY (`B`) REFERENCES `SettingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingItemsToBuffingWastage` ADD CONSTRAINT `_BuffingItemsToBuffingWastage_A_fkey` FOREIGN KEY (`A`) REFERENCES `BuffingItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BuffingItemsToBuffingWastage` ADD CONSTRAINT `_BuffingItemsToBuffingWastage_B_fkey` FOREIGN KEY (`B`) REFERENCES `BuffingWastage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
