import express from 'express';
import { createBuffingEntry, getBuffingEntriesByPersonId } from '../Controllers/buffingEntryController.js';
const router = express.Router();

router.post("/",createBuffingEntry );
router.get("/person/:buffing_person_id/:lotNumber", getBuffingEntriesByPersonId)

export default router;

