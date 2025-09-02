import express from 'express';
import { createPurchase,getPurchase,updatePurchase,deletePurchase } from '../Controllers/purchaseController.js';


const router = express.Router();

router.post ("/",createPurchase);
router.get ("/",getPurchase);
router.put("/:id",updatePurchase);
router.delete("/:id",deletePurchase);


export default router;



// http://localhost:5000/api/purchase