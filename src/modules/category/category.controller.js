import categoryService from "./category.service.js";

import User from "../user/user.model.js";

export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await categoryService.getCategories(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoryService.getCategoryById(id);
    res.status(200).json(category);
  } catch (error) {
    if (error.message === "Invalid category ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Category not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    let userId;

    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    console.log("Final userId:", userId);

    const category = await categoryService.createCategory(req.body, userId);
    res.status(201).json(category);
  } catch (error) {
    if (error.message === "Category name already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("req.user:", req.user);

    let userId;

    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    console.log("Final userId:", userId);

    const updatedCategory = await categoryService.updateCategory(
      id,
      req.body,
      userId
    );
    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.message === "Invalid category ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Category not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Category name already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const changeCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    let userId;

    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    console.log("Final userId:", userId);
    const updatedCategory = await categoryService.changeCategoryStatus(
      id,
      status,
      userId
    );
    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.message === "Invalid category ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Category not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Invalid status transition") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
