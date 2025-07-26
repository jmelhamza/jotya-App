// server/controllers/auth.controller.js
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

// ❌ تم حذف دالة التسجيل بالكامل
/*
export const register = async (req, res) => {
  // ... (تم حذف الكود)
};
*/

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // التحقق من وجود المستخدم
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    // التحقق من أن المستخدم هو مسؤول
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' }); // 👈 إضافة هذا الشرط
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `invalid credentials` });
    }

    // إنشاء التوكن إذا كان كل شيء صحيحاً
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err); // 👈 إضافة هذا السطر لتصحيح الأخطاء
    res.status(500).json({ message: "something went wrong" });
  }
};