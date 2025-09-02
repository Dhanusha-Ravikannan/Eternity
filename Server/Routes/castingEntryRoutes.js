import express from 'express';
import {
  createCastingEntry,
  getAllCastingEntry,
  getCastingEntryById,
  updateCastingEntry,
  deleteCastingEntry
} from '../Controllers/castingEntryController.js';

const router = express.Router();

router.post("/", createCastingEntry);             // CREATE
router.get("/", getAllCastingEntry);              // READ ALL
router.get("/:id", getCastingEntryById);          // READ BY ID
router.put("/:id", updateCastingEntry);           // UPDATE
router.delete("/:id", deleteCastingEntry);        // DELETE

export default router;



//post -  http://localhost:5000/api/castingentry