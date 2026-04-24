# AI-Based Customer Support System 🚀

A premium, AI-powered customer support platform designed specifically for web hosting and domain service providers. Built with a modern tech stack focusing on performance, scalability, and a superior user experience.

---

## ✨ Features

- **🤖 Intelligent AI Chatbot**: Powered by NLP and Gemini AI to provide instant support for hosting and domain-related queries.
- **🎫 Advanced Ticketing System**: Comprehensive support workflow including ticket creation, categorization, and attachment support (powered by Multer).
- **📊 Admin Control Center**: A dedicated workspace for support agents to manage tickets, analyze AI performance, and oversee user interactions.
- **🎨 Premium UI/UX**: Ultra-modern dark-themed interface utilizing glassmorphism, fluid animations (Framer Motion), and responsive design.
- **🔐 Secure Authentication**: Robust security layout using JWT (JSON Web Tokens) and bcrypt for password hashing.
- **💬 Real-time Updates**: Live ticket status updates and notifications (Socket.io).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: Vanilla CSS with Glassmorphism
- **Icons**: Lucide-React
- **State/Routing**: React Router DOM, Axios

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: Express.js
- **Database**: MySQL (mysql2)
- **AI/NLP**: Google Generative AI (Gemini), Natural, Sentiment, Compromise
- **Other**: JWT, BcryptJS, Multer, Socket.io, Nodemailer

---

## 🏗️ Project Structure

```text
├── backend/            # Express API, AI services, and Business Logic
├── frontend/           # React Application (Vite-based)
├── database/           # SQL Schema and Migration Scripts
├── README.md           # Documentation
└── .gitignore          # Repository exclusions
```

---

## ⚡ Setup Guide

### 1. Database Configuration
1. Create a MySQL database (e.g., `customer_support_db`).
2. Import the schema:
   ```bash
   mysql -u your_username -p customer_support_db < database/schema.sql
   ```

### 2. Backend Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=customer_support_db
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```

---

## 📝 License

This project is licensed under the MIT License.

