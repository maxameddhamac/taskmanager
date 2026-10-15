import User from "../models/users.js";
import { generateToken } from "../utilities/generatetoken.js";

export const getusers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getuserinfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
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
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });
    await user.save();

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return next(error);
  }
};

export const createManagedUser = async (req, res, next) => {
  try {
    const { name, email, password, role } =
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

    if (role !== "user" && role !== "admin") {
      return res
        .status(400)
        .json({ message: "Role must be 'user' or 'admin'" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });
    await user.save();

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(updatedUser);
  } catch (err) {
    return next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  const { role } = req.body ?? {};

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};
