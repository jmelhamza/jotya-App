  import Product from "../models/product.model.js"
  import mongoose from "mongoose"
  
  
   
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.status(200).json({ succes: true, data: products });
  } catch (error) {
    console.log('error in fetching products', error.message);
    res.status(500).json({ succes: false, message: 'server error' });
  }
};

export const createProduct = async (req, res) => {
  const { title, price, image, description } = req.body;

  if (!title || !price || !image) {
    return res.status(400).json({ success: false, message: "Please provide all fields" });
  }

  const newProduct = new Product({
    title,
    price,
    image,
    description,
    seller: req.user.id  // ✅ كيضيف تلقائيا المالك من JWT
  });

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("error in create product", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


  
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ تحقق من الصلاحية
    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json({ success: true, data: updatedProduct });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


   export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ تحقق واش المستخدم هو المالك أو admin
    if (product.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// route: GET /api/products/user/:userId
export const getProductsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const products = await Product.find({ seller: userId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};


