import express from "express";
import { createBuffingItem, deleteBuffingItem, getAllBuffingItems, getBuffingItemById } from "../Controllers/buffingItemsController.js";

const router = express.Router();

router.post("/", createBuffingItem);
router.get("/", getAllBuffingItems);
router.get("/:id", getBuffingItemById)
router.delete("/:id",deleteBuffingItem)

export default router;