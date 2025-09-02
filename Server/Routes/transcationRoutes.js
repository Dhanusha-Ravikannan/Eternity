
import express from 'express';
import { createTransaction,getAllTransactions } from '../Controllers/transcationControllers.js';
const router = express.Router();

router.post("/", createTransaction);

router.get("/:customerId",getAllTransactions);

export default router;
