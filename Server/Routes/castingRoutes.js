import express from 'express';
import { createCasting,updateCasting,getCasting,deleteCasting, getCastingById } from '../Controllers/castingController.js';


const router = express.Router();

router.get("/", getCasting);
router.post("/", createCasting);
router.put("/:id" , updateCasting);
router.delete("/:id", deleteCasting);
router.get("/:id", getCastingById)

export default router


// Post - http://localhost:5000/api/casting/