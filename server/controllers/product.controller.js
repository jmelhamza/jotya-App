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
     const newProduct  = new Product (product )
     try{
 await newProduct.save()
res.status(201).json({succes :true,data : newProduct})
     }
      catch (error){
       console.error ('error in create product',error.message)
       res.status(500).json({succes:false , message :"server error"}) 
      }
}
  
export const updateProduct =async(req,res)=>{
const {id}= req.params
const product = req.body
try{
     const updatedProduct =   await Product.findByIdAndUpdate(id , product,{new:true})
     res.status(200).json({succes :true,data :updatedProduct})
}catch (error){
    res.status(500).json({succes :false,data :"server error"})

}
   }

   export const deleteProduct =async (req,res)=>{
   const {id}=req.params 
   try {
    await Product.findByIdAndDelete(id)
    res.status(200).json({succes:true,message:'product deleted'})

   } catch (error) {
    res.status(404).json({succes:false,message:'product not found'})
   }
}