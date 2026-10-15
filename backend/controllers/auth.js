import User from "../models/users.js";
import { generateToken } from "../utilities/generatetoken.js";

// register user

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } =
      req.body && typeof req.body === "object" ? req.body : {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail }).collation(
      {
        locale: "en",
        strength: 2,
      },
    );
    if (userExists) {
      return res.status(409).json({
        message:
          "An account with this email already exists. Log in or use another email.",
      });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "An account with this email already exists. Log in or use another email.",
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } =
      req.body && typeof req.body === "object" ? req.body : {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).collation({
      locale: "en",
      strength: 2,
    });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
