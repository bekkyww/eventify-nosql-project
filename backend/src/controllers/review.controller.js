import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { recalcProductRating } from "../utils/recalcRating.js";

export const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || rating == null) throw new ApiError(400, "productId and rating are required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const review = await Review.create({
    productId,
    userId: req.user._id,
    rating: Number(rating),
    comment: comment || ""
  });

  await recalcProductRating(product._id);

  res.status(201).json({ success: true, review });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.id })
    .sort({ createdAt: -1 })
    .populate("userId", "name role");

  res.json({ success: true, reviews });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = String(review.userId) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "Not allowed");

  await review.deleteOne();
  await recalcProductRating(review.productId);

  res.json({ success: true, message: "Review deleted" });
});
