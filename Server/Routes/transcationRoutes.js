
import express from 'express';
import { createTransaction,getAllTransactions, getAllTransactionsWithoutCustomer } from '../Controllers/transcationControllers.js';
const router = express.Router();

router.post("/", createTransaction);

router.get("/:customerId",getAllTransactions);

router.get("/",getAllTransactionsWithoutCustomer);

export default router;
