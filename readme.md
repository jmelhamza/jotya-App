# 🛒 Jotya.com – Flea Market Web App

Welcome to **Jotya**, a web platform designed to facilitate the sale and purchase of second-hand and scrap products, especially those commonly found in flea markets (Marché aux puces).

🌐 **Live site:** [www.jotya.com](http://www.jotya.com)

---

## 📌 Table of Contents

- [Project Description](#-project-description)
- [Target Users](#-target-users)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Folder Structure](#-folder-structure)
- [License](#-license)

---

## 📖 Project Description

Jotya.com allows **sellers**, especially from the flea market sector, to list their used items for sale. Each product listing includes:

- Product image and details
- Seller’s phone number
- Facebook profile link

🔔 **Note:** The platform does **not** include integrated chat or payment systems. All negotiations and transactions are handled **externally** between buyers and sellers.

---

## 🎯 Target Users

- **Sellers:** Individuals looking to sell used or scrap products.
- **Buyers:** Users seeking to purchase second-hand items for industrial, commercial, or personal use.
- **Admins:** Moderators responsible for managing users, listings, and maintaining the integrity of the platform.

---

## ✨ Features

- ✅ User registration and login with JWT
- 🛍️ Product display with images and details
- ✍️ Sellers can add, edit, and delete their own listings
- 📊 Admin dashboard to manage users and listings
- 🔗 Direct contact through phone or Facebook – no middlemen
- 🔐 Secure authentication and password encryption

---

## ⚙️ How It Works

1. A seller registers and logs in.
2. They post products with pictures, prices, and contact info.
3. Buyers browse products and contact sellers directly.
4. Transactions occur outside the platform (by phone or Facebook).

---

## 💻 Tech Stack

### Frontend – built with React

| Technology     | Purpose                               |
|----------------|----------------------------------------|
| React.js       | UI framework for dynamic components    |
| React Router   | Routing and SPA navigation             |
| Axios          | API requests to backend                |
| ShadCN UI      | Beautiful and responsive UI components |

### Backend – built with Node.js

| Technology     | Purpose                               |
|----------------|----------------------------------------|
| Node.js + Express.js | RESTful API server             |
| MongoDB + Mongoose  | NoSQL database and ORM         |
| JWT (jsonwebtoken)  | Authentication system           |
| bcrypt.js           | Password hashing                |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/jotya.git
cd jotya

# Backend
cd server
npm install
npm run dev

# Frontend
cd ../client
npm install
npm start
.