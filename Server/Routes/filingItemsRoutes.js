import express from "express";
import {
  createFilingItem,
  getAllFilingItems,
  getFilingItemById,
  deleteFilingItem,
  getAvailableFilingItems,
  createFilingWastage,
  getFilingWastageByEntryId,
  updateFilingWastage,
  closeJobcardAndCreateNewLot
} from "../Controllers/filingItemsController.js";

const router = express.Router();

router.post("/", createFilingItem);
router.get("/", getAllFilingItems);
router.get("/:id", getFilingItemById);
router.delete("/:id", deleteFilingItem);

router.get("/filingitems/available", getAvailableFilingItems);

router.post("/wastage", createFilingWastage);
router.get("/entry/:filingPersonId/:lotNumber", getFilingWastageByEntryId);
router.put('/wastage/:id', updateFilingWastage);
router.post('/close-jobcard', closeJobcardAndCreateNewLot);

export default router;
