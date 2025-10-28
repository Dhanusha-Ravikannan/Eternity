import express from "express";
import {createCustomer,getCustomers,updateCustomer,deleteCustomer, getHallmarkByCustomerId, getCustomerReportDetailsById, customerReport} from '../Controllers/customerController.js'
const router = express.Router();
router.get("/", getCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.get("/:customerId", getHallmarkByCustomerId);
router.get("/customerReport/:id", getCustomerReportDetailsById);
router.get("/customerReportt/:id", customerReport )

export default router;
