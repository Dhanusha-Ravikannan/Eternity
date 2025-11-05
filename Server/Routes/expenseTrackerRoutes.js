import express from "express";
import {  getAllExpenseVouchers, createExpenseVoucher, updateExpenseVoucher, deleteExpenseVoucher} from "../Controllers/expenseTrackerController.js";
const router = express.Router();


router.post("/", createExpenseVoucher);
router.get("/", getAllExpenseVouchers);
router.put("/:id", updateExpenseVoucher);
router.delete("/:id", deleteExpenseVoucher); 

export default router;
