import express from 'express';
import { createSetting,getSetting,updateSetting,deleteSetting, getSettingById } from '../Controllers/settingControllers.js';

const router = express.Router();

router.post("/",createSetting);
router.get("/",getSetting);
router.put("/:id",updateSetting);
router.delete("/:id",deleteSetting);
router.get('/:id', getSettingById);

export default router;

