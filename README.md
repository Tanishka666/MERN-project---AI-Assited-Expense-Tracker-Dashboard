# AI-Assisted Expense Tracker Dashboard

## Overview

AI-Assisted Expense Tracker Dashboard is a MERN stack web application designed to help users manage and analyze their daily expenses. The application provides expense tracking, category-wise analysis, interactive visualizations, and AI-assisted insights to help users understand their spending habits and make informed financial decisions.

## Features

* User Authentication (Login & Registration)
* Add, Edit, and Delete Expenses
* Expense Categorization
* Interactive Dashboard
* Category-wise Spending Analysis
* Monthly Expense Tracking
* AI-Assisted Expense Insights
* Chat-style Expense Assistant
* Budget Monitoring
* Responsive User Interface

## Tech Stack

### Frontend

* React.js
* JavaScript (ES6)
* Tailwind CSS
* Recharts
* Axios
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* MongoDB Compass

### AI Features

* Rule-Based Expense Analysis
* Expense Categorization
* Spending Pattern Insights
* Transformers.js (@xenova/transformers)

## Project Structure

```text
expense-tracker-ai/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
node server.js
```

## Environment Variables

Create a `.env` file inside the backend folder and add:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

## Key Functionalities

### Expense Management

* Record daily expenses
* Store transaction details
* Manage expense history

### Analytics Dashboard

* Total expenses overview
* Category-wise breakdown
* Spending trend visualization
* Budget tracking

### AI-Assisted Insights

* Analyze spending behavior
* Identify major expense categories
* Generate basic financial suggestions
* Support expense-related user queries

## Future Enhancements

* Advanced AI recommendations
* Expense forecasting
* Export reports to PDF
* Email notifications
* Multi-user collaboration
* Mobile application support

## Author

Tanishka Gandhi

Computer Engineering Student
