import express from "express";
import {createCustomer,getCustomers,updateCustomer,deleteCustomer, getHallmarkByCustomerId} from '../Controllers/customerController.js'
const router = express.Router();
router.get("/", getCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.get("/:customerId", getHallmarkByCustomerId);

export default router;
