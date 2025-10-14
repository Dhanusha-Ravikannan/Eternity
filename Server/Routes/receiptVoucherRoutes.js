import express from "express";
import { createReceiptVoucher } from "../Controllers/receiptVoucherController.js";



const router = express.Router();

router.post("/receipt", createReceiptVoucher);

export default router;
