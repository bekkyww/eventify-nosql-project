import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  myListings
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/my/listings", protect, myListings);

router.post("/", protect, createProduct);
router.get("/:id", getProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
