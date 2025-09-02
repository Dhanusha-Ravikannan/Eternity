import express from 'express';
import { createSupplier, deleteSupplier, getSupplier, updateSupplier } from "../Controllers/supplierControllers.js"

const router = express.Router();

router.post("/",createSupplier);
router.get("/", getSupplier);
router.put("/:id",updateSupplier);
router.delete("/:id", deleteSupplier)

export default router;
