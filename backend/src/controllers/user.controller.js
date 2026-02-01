import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/User.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "email", "password"];
  const updates = {};
  for (const k of allowed) if (req.body[k] != null) updates[k] = req.body[k];

  // password надо через save (чтобы хешировался)
  if (updates.password) {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email.toLowerCase();
    user.password = updates.password;
    await user.save();
    const fresh = await User.findById(req.user._id).select("-password");
    return res.json({ success: true, user: fresh });
  }

  if (updates.email) updates.email = updates.email.toLowerCase();

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select("-password");
  res.json({ success: true, user });
});
