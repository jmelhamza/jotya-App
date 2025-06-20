  import Product from "../models/product.model.js"
  import mongoose from "mongoose"
  
  
  export  const getProducts = async (req,res)=>{
    try {
        const products = await Product.find( {})
        res.status(200).json({succes:true,data : products})
         
    } catch (error){
        console.log ('error in fttching products',error.message)
        res.status(500).json({succes:false,message : 'server error '})
    }
}  


export const createProduct = async(req,res)=>{
const product =req.body 
if (!product.title || !product.price || !product.image){
        return res.status (400).json ({succes : false ,  message : "please provide all fields"})
     }
     const newProduct  = new Product ({
    title,
    price,
    image,
    description,
    seller: req.user.id 
  })
     try{
 await newProduct.save()
res.status(201).json({succes :true,data : newProduct})
     }
      catch (error){
       console.error ('error in create product',error.message)
       res.status(500).json({succes:false , message :"server error"}) 
      }
}

  
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
