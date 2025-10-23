import express from 'express';
import { createSettingEntry, getAllLotSettingMapperWithItems, getLotSettingMapperWithItems, getReportSettingEntries, getSettingEntriesByPersonId, getSettingEntryById } from '../Controllers/settingEntryController.js';
const router = express.Router();


router.post("/", createSettingEntry);
router.get("/person/:setting_person_id/:lotNumber", getSettingEntriesByPersonId);
router.get('/lotsettingmapper/:id',getLotSettingMapperWithItems);
router.get("/lotsettingmapper", getAllLotSettingMapperWithItems);
router.get("/get-report-entries", getReportSettingEntries);
router.get("/settingentry/:id", getSettingEntryById)

export default router;




