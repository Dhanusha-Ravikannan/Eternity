import express from 'express';
import {createCastingItem,getAllCastingItems,getCastingItemById,deleteCastingItem, getAvailableCastingItems } from "../Controllers/castingItemsController.js";

const router = express.Router();

router.post("/", createCastingItem);        
router.get("/", getAllCastingItems);           
router.get("/:id", getCastingItemById);        
router.delete("/:id", deleteCastingItem);

router.get('/castingitems/available', getAvailableCastingItems);


export default router;


// Post - http://localhost:5000/api/castingitems