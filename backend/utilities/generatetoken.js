import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const secret = process.env.jwtSecret || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in Environment Variables.");
  }
  return jwt.sign({ id: user._id || user.id }, secret, { expiresIn: "4h" });
};
