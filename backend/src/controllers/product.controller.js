import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Product from "../models/Product.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, stock, categoryId } = req.body;
  if (!name || price == null || stock == null) {
    throw new ApiError(400, "name, price, stock are required");
  }

  const product = await Product.create({
    name,
    price,
    stock,
    categoryId: categoryId || null,
    sellerId: req.user._id
  });

  res.status(201).json({ success: true, product });
});

export const listProducts = asyncHandler(async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (categoryId) filter.categoryId = categoryId;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = Number(minPrice);
    if (maxPrice != null) filter.price.$lte = Number(maxPrice);
  }

  const sortObj =
    sort === "price_asc" ? { price: 1 } :
    sort === "price_desc" ? { price: -1 } :
    sort === "new" ? { createdAt: -1 } :
    { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select("name price stock sellerId ratingAvg ratingCount createdAt")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    products: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("sellerId", "name email role")
    .populate("categoryId", "name");

  if (!product) throw new ApiError(404, "Product not found");

  res.json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  // user может менять только свой product, admin — любой
  const isOwner = String(product.sellerId) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "Not allowed");

  const allowed = ["name", "price", "stock", "categoryId"];
  for (const k of allowed) {
    if (req.body[k] != null) product[k] = req.body[k];
  }
  await product.save();

  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const isOwner = String(product.sellerId) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "Not allowed");

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

export const myListings = asyncHandler(async (req, res) => {
  const products = await Product.find({ sellerId: req.user._id })
    .select("name price stock sellerId ratingAvg ratingCount createdAt")
    .sort({ createdAt: -1 });

  res.json({ success: true, products });
});
