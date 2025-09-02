import express from 'express';
import {getAddItems,updateAddItems,deleteAddItems, createAddItems } from '../Controllers/additemControllers.js';

const router = express.Router();

router.post ("/",createAddItems);
router.get ("/", getAddItems);
router.put("/:id",updateAddItems);
router.delete("/:id",deleteAddItems)


export default router;