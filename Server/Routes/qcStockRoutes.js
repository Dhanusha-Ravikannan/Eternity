
import express from 'express';
import { createQCStock, deleteQCStock, getQCStock, updateQCStock, getUnUsedQCStock } from '../Controllers/qcStockController.js';
const router = express.Router();

router.post("/", createQCStock);
router.get("/", getQCStock);
router.get("/filtered-qc-stock", getUnUsedQCStock);
router.put("/:id" , updateQCStock);
router.delete("/:id", deleteQCStock);

export default router;