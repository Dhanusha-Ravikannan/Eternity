import express from "express";
const router = express.Router();
import {
  createBill,
  getAllBills,
  getBillById,
  getBillsByCustomerId,
} from "../Controllers/billControllers.js";

router.post("/", createBill);
router.get("/", getAllBills);
router.get("/:id", getBillById);
router.get("/customer/:customerId", getBillsByCustomerId);

export default router;