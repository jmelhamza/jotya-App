import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

 export const register =async(req,res)=>{
    try {
   const  {name,email,password }=req.body
   const hashedpassword =await bcrypt.hash(password,10)

   const newUser = new User({name,email,password:hashedpassword })
   await newUser.save()
   res.status(201).json({message:`user registred with username${name}`})
}catch(err){
 res.status(500).json({message :"something went wrong"})   
}
 }

 export const login =async(req,res)=>{
    try{ 
    const {email,password}=req.body
    const user = await User.findOne({email})
    if(!user){
return res.status(404).json({message:'user not found '})
    }
    const isMatch =await bcrypt.compare(password,user.password)
    if(!isMatch){
    return res.status(400).json({message:`invalid credentials`})
    }
    const token =jwt.sign(
{id: user._id , role:user.role},process.env.JWT_SECRET,
{expiresIn:"1h"}
    )
    res.status(200).json({token})
    }catch (err){
 res.status(500).json({message :"something went wrong"})
    }
 }