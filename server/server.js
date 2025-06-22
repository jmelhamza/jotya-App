import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js"
import { userRoutes } from "./routes/user.routes.js"
import authRoutes from './routes/auth.router.js';
import cors from "cors"



dotenv.config();
const app = express();

const PORT =process.env.PORT || 5000

 app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json())

app.use("/api/products",productRoutes)
app.use("/api/users",userRoutes)
app.use('/api/auth',authRoutes)





app.listen(5000,()=>{
    connectDB()
    console.log('server started at http://localhost:'+PORT)
})

