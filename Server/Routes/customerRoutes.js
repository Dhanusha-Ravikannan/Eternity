import express from "express";
import {createCustomer,getCustomers,updateCustomer,deleteCustomer} from '../Controllers/customerController.js'
const router = express.Router();
router.get("/", getCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
