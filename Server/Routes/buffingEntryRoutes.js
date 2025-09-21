import express from 'express';
import { createBuffingEntry, getBuffingEntriesByPersonId, getReportBuffingEntries } from '../Controllers/buffingEntryController.js';
const router = express.Router();

router.post("/",createBuffingEntry );
router.get("/person/:buffing_person_id/:lotNumber", getBuffingEntriesByPersonId);
router.get("/get-report-entries", getReportBuffingEntries);

export default router;



