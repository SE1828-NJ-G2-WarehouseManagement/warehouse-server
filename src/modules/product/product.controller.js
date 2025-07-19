import User from "../user/user.model.js";
import productService from "./product.service.js";

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
      publicId: req.file.filename, 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createProduct = async (req, res) => {
  try {
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
    // Lấy đường dẫn ảnh từ file upload
    const product = await productService.createProduct(req.body, userId);
    res.status(201).json(product);
  } catch (error) {
    if (error.message === "Product name already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
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
    const updatedProduct = await productService.updateProduct(
      id,
      req.body,
      userId
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const changeProductAction = async (req, res) => {
  try {
    const { action } = req.body;
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
    if (!["ACTIVE", "INACTIVE"].includes(action)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updatedProduct = await productService.changeProductStatus(
      id,
      action,
      userId
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getActiveProducts = async (req, res) => {
  try {
    const products = await productService.getActiveProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(401).json({ message: "User not found" });
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    const product = await productService.approveProduct(id, userId);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const note = req.body.note;
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(401).json({ message: "User not found" });
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    const product = await productService.rejectProduct(id, userId, note);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};