import categoryService from "./category.service.js";

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
    const category = await categoryService.createCategory(req.body);
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
    const updatedCategory = await categoryService.updateCategory(id, req.body);
    res.status(200).json(updatedCategory);
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

export const changeCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updatedCategory = await categoryService.changeCategoryStatus(id, status);
    res.status(200).json(updatedCategory);
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