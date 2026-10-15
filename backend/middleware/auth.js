import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const protect = async (req, res, next) => {
  const [scheme, token] =
    req.headers.authorization?.trim().split(/\s+/, 2) ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const secret = process.env.jwtSecret || process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Authentication is not configured" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({ message: "No token provided" });
  }

  if (typeof decoded !== "object" || typeof decoded.id !== "string") {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "No token provided" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
