import express from "express";
import {
  createSettingItem,
  deleteSettingItem,
  getAllSettingItems,
  getSettingItemById,
  createSettingWastage,
  getSettingWastageByEntryId,
  updateSettingWastage,
  closeJobcardAndCreateNewLot,
} from "../Controllers/settingItemsController.js";

const router = express.Router();



router.post("/", createSettingItem);
router.get("/", getAllSettingItems);
router.get("/:id", getSettingItemById);
router.delete("/:id", deleteSettingItem);

router.post("/wastage", createSettingWastage);
router.get("/entry/:settingPersonId/:lotNumber", getSettingWastageByEntryId);
router.put("/wastage/:id", updateSettingWastage);
router.post("/close-jobcard", closeJobcardAndCreateNewLot);

export default router;

