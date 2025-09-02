import express from 'express';
import { createSettingEntry, getLotSettingMapperWithItems, getSettingEntriesByPersonId } from '../Controllers/settingEntryController.js';
const router = express.Router();


router.post("/", createSettingEntry);
router.get("/person/:setting_person_id", getSettingEntriesByPersonId);
router.get('/lotsettingmapper/:id',getLotSettingMapperWithItems)

export default router;

