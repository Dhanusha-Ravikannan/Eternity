import express from 'express';
import { createPurchase, deletePurchase, getPurchase, savePurchase, updatePurchase, } from '../Controllers/purchaseController.js';

const router = express.Router();

router.post ("/",createPurchase);
router.get ("/",getPurchase);
router.put("/:id",updatePurchase);
router.delete("/:id",deletePurchase);

router.post("/purchase", savePurchase);
router.put("/purchase/:id", savePurchase);



export default router;



// http://localhost:5000/api/purchase