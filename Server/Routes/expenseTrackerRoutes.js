import express from "express";
import { createExpenseVoucher, getAllExpenseVouchers } from "../Controllers/expenseTrackerController.js";
const router = express.Router();


router.post("/", createExpenseVoucher);
router.get("/", getAllExpenseVouchers);

export default router;
