import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { addReview, getProductReviews, deleteReview } from "../controllers/review.controller.js";

const router = Router();

router.post("/", protect, addReview);
router.get("/product/:id", getProductReviews);
router.delete("/:id", protect, deleteReview);

export default router;
