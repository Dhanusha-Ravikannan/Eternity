import express from "express";
import { createReceiptVoucher, getAllReceiptVouchers } from "../Controllers/receiptVoucherController.js";



const router = express.Router();

router.post("/receipt", createReceiptVoucher);
router.get("/", getAllReceiptVouchers)

export default router;
