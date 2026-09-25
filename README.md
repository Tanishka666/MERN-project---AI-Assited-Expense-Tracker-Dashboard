# AI-Assisted Expense Tracker Dashboard

A full-stack expense tracking web application built using the MERN stack. The application allows users to manage daily expenses, visualize spending patterns, and automatically categorize expenses using semantic similarity.

## Features

- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Email verification during signup
- Add and manage daily expenses
- AI-assisted expense categorization
- Semantic text classification using Transformers.js
- Interactive spending charts using Recharts
- Category-wise expense analysis
- Spending insights
- Chat-style expense assistance
- Budget alert email notifications
- MongoDB-based data storage
- Responsive dashboard using Tailwind CSS

## AI Expense Categorization

The application uses `@xenova/transformers` with the `Xenova/all-MiniLM-L6-v2` model.

Expense descriptions and predefined category descriptions are converted into embeddings. Cosine similarity is then used to determine the most relevant expense category.

### Flow

Expense Description  
↓  
MiniLM Embedding Model  
↓  
Text Embedding  
↓  
Cosine Similarity with Category Embeddings  
↓  
Best Matching Category

## Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Recharts
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer

### AI
- Transformers.js
- `@xenova/transformers`
- `Xenova/all-MiniLM-L6-v2`

## Project Structure

```text
expense-tracker-ai/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       └── App.jsx
│
├── .gitignore
└── README.md
