import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name : { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  
  image: {
    type: String,
    default: ''
  },
  phone: {  
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
}
})
const User = mongoose.model('User',userSchema)
export default User