import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res, next) {
  try {
    const { email, name, password, role } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email already used" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: role || "attendee"
    });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
