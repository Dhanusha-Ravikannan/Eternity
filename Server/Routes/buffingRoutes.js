import express from "express";
import {
  createBuffing,
  getBuffing,
  updateBuffing,
  deleteBuffing,
  getBuffingById,
  createBuffingWastage,
  getBuffingWastageByEntryId,
  updateBuffingWastage,
  closeJobcardAndCreateNewLot,
} from "../Controllers/buffingController.js";

const router = express.Router();

router.post("/", createBuffing);
router.get("/", getBuffing);
router.put("/:id", updateBuffing);
router.delete("/:id", deleteBuffing);
router.get("/:id", getBuffingById);

router.post("/wastage", createBuffingWastage);
router.get("/entry/:buffingPersonId/:lotNumber", getBuffingWastageByEntryId);
router.put("/wastage/:id", updateBuffingWastage);
router.post("/close-jobcard", closeJobcardAndCreateNewLot);




export default router;


