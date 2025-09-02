import express from 'express';
import { createTouchItems,getTouchItems,updateTouchItems,deleteTouchItems } from '../Controllers/addTouchControllers.js';

const router = express.Router();

router.post ("/",createTouchItems);
router.get ("/", getTouchItems);
router.put("/:id",updateTouchItems);
router.delete("/:id",deleteTouchItems)


export default router;

// Post - http://localhost:5000/api/addtouch