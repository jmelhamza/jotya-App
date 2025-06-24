import User from "../models/user.model.js";



 export const getDetailUser = async (req, res) => {
    try {
        const result =  await User.find()
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message : "Error in fetching" })
    }
}
 export const postUsers = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save()
        res.status(200).json(newUser)
    } catch (error) {
        res.status(500).json({ message : "Error in post" })
    }
}

 export const putUser = async (req, res) => {
    const {id} = req.params
    const detail = req.body
    try {
        const result = await User.findByIdAndUpdate(id, detail, { new: true })
        if(!result){
            return  res.status(404).json({ message : "Not found" })
        }
        
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message : "Error in put" })
    }
}
 export const deleteUser = async (req, res) => {
    const {id} = req.params
    const detail = req.body
    try {
        const result = await User.findByIdAndDelete(id, detail, { new:  true })
        if(!result){
            return  res.status(404).json({ message : "Not found" })
        }
        
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message : "Error in delete" })
    }
}
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // استبعد كلمة المرور من الرد
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
