import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CreditCard,
  PieChart,
  Brain,
  Trash2,
  Target,
  LogOut
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useAuth } from "../context/AuthContext";
import { expenseAPI, aiAPI, notificationAPI } from "../services/api";

const FIXED_ALERT_BUDGET = 20000;

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // 🔒 alertBudget is fixed, not editable
  const [alertBudget] = useState(FIXED_ALERT_BUDGET);
  const [showChat, setShowChat] = useState(false);
const [chatInput, setChatInput] = useState("");
const [chatResponse, setChatResponse] = useState("");

  const [stats, setStats] = useState({
    totalSpent: 0,
    monthlyBudget: 50000,
    budgetRemaining: 50000,
    categoryBreakdown: {}
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNotifications([]);
    }
  };

  const loadDashboardData = async () => {
    const res = await expenseAPI.getAll();
    const data = res.data || [];

    setTransactions(data);

    const expensesOnly = data.filter((t) => t.type === "expense");
    const totalSpent = expensesOnly.reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown = {};
    expensesOnly.forEach((t) => {
      categoryBreakdown[t.category] =
        (categoryBreakdown[t.category] || 0) + t.amount;
    });

    setStats({
      totalSpent,
      monthlyBudget: 50000,
      budgetRemaining: 50000 - totalSpent,
      categoryBreakdown
    });
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || aiLoading) return;

    try {
      setAiLoading(true);
      const res = await aiAPI.categorize(newExpense.description);
      const aiCategory = res.data.category;

      await expenseAPI.create({
        description: newExpense.description,
        amount: Number(newExpense.amount),
        category: aiCategory,
        date: newExpense.date
      });

      setShowAddExpense(false);
      setNewExpense({ description: "", amount: "", date: newExpense.date });
      loadDashboardData();
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await expenseAPI.delete(id);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981","#cde68c","#0e7a24","#e46013","#3811ea"];

  const categoryData = Object.entries(stats.categoryBreakdown).map(
    ([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length]
    })
  );

  //Chatbot
 const handleChatQuery = () => {
  const query = chatInput.toLowerCase();

  // Highest spending day
  if (
    query.includes("highest") ||
    query.includes("highest day") ||
    query.includes("spending day")
  ) {
    setChatResponse(
      `Your highest spending day was ${highestDay.day} with ₹${highestDay.spent}`
    );
  }

  // Average spending
  else if (
    query.includes("average") ||
    query.includes("avg")
  ) {
    setChatResponse(
      `Your average daily spending is ₹${avgSpending}`
    );
  }

  // Total spending
  else if (
    query.includes("total") ||
    query.includes("total spent")
  ) {
    setChatResponse(
      `You spent ₹${stats.totalSpent} in total`
    );
  }
// Lowest category
  else if (
    query.includes("lowest category") ||
    query.includes("least spending")
  ) {
    const categories = Object.entries(
      stats.categoryBreakdown
    );

    if (categories.length === 0) {
      setChatResponse("No category data available.");
      return;
    }

    const lowestCategory = categories.reduce(
      (min, [cat, amt]) =>
        amt < min.amount
          ? { name: cat, amount: amt }
          : min,
      {
        name: categories[0][0],
        amount: categories[0][1]
      }
    );

    setChatResponse(
      `${lowestCategory.name} is your lowest spending category with ₹${lowestCategory.amount}`
    );
  }

  // Highest category
  else if (
    query.includes("category") ||
    query.includes("food") ||
    query.includes("highest category") ||
    query.includes("top category")
  ) {
    const highestCategory = Object.entries(
      stats.categoryBreakdown
    ).reduce(
      (max, [cat, amt]) =>
        amt > max.amount
          ? { name: cat, amount: amt }
          : max,
      { name: "N/A", amount: 0 }
    );

    setChatResponse(
      `You spent the most on ${highestCategory.name} (₹${highestCategory.amount})`
    );
  }

  
  // Budget left
  else if (
    query.includes("budget left") ||
    query.includes("remaining budget") ||
    query.includes("budget remaining")
  ) {
    setChatResponse(
      `You have ₹${stats.budgetRemaining} remaining from your ₹${stats.monthlyBudget} budget`
    );
  }

  // Budget usage
  else if (
    query.includes("budget usage") ||
    query.includes("percentage") ||
    query.includes("budget used")
  ) {
    const percent = Math.round(
      (stats.totalSpent / stats.monthlyBudget) * 100
    );

    setChatResponse(
      `You have used ${percent}% of your monthly budget`
    );
  }

  // Transaction count
  else if (
    query.includes("transactions") ||
    query.includes("transaction count") ||
    query.includes("how many expenses")
  ) {
    setChatResponse(
      `You have recorded ${transactions.length} transactions`
    );
  }

  // Today's spending
  else if (
    query.includes("today") ||
    query.includes("today spending")
  ) {
    const todayDate = new Date()
      .toISOString()
      .split("T")[0];

    const todaySpent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date)
            .toISOString()
            .split("T")[0] === todayDate
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    setChatResponse(
      `You spent ₹${todaySpent} today`
    );
  }

  // Largest expense
  else if (
    query.includes("highest expense") ||
    query.includes("largest transaction") ||
    query.includes("biggest expense")
  ) {
    const expenses = transactions.filter(
      (t) => t.type === "expense"
    );

    if (expenses.length === 0) {
      setChatResponse("No expenses found.");
      return;
    }

    const highestExpense = expenses.reduce(
      (max, t) =>
        t.amount > max.amount ? t : max
    );

    setChatResponse(
      `Your largest expense was ₹${highestExpense.amount} for ${highestExpense.description}`
    );
  }

  // Budget alert
  else if (
    query.includes("alert") ||
    query.includes("budget alert")
  ) {
    if (stats.totalSpent > alertBudget) {
      setChatResponse(
        `Budget alert triggered. You crossed ₹${alertBudget}`
      );
    } else {
      setChatResponse(
        `Budget alert not triggered. Current spending is ₹${stats.totalSpent}`
      );
    }
  }

  // Summary
  else if (
    query.includes("summary") ||
    query.includes("overview")
  ) {
    setChatResponse(
      `Total Spent: ₹${stats.totalSpent}, Remaining Budget: ₹${stats.budgetRemaining}, Transactions: ${transactions.length}`
    );
  }

  // Trend
  else if (
    query.includes("trend") ||
    query.includes("spending trend")
  ) {
    if (avgSpending > 1000) {
      setChatResponse(
        "Your spending trend is relatively high during the last 30 days."
      );
    } else {
      setChatResponse(
        "Your spending trend appears well controlled."
      );
    }
  }

  // Fallback
  else {
    setChatResponse(
      "Try asking: highest spending day, average spending, total spent, highest category, lowest category, budget left, budget usage, transactions, today spending, largest expense, summary, trend, or budget alert."
    );
  }
};

 // 📅 LAST 30 DAYS SPENDING (continuous)

const last30Days = [];
const today = new Date();

// create last 30 days structure
for (let i = 29; i >= 0; i--) {
  const d = new Date();
  d.setDate(today.getDate() - i);

  last30Days.push({
    date: d.toISOString().split("T")[0],
    day: d.toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
}),
    spent: 0,
  });
}

// map transactions into correct day
transactions.forEach((t) => {
  if (t.type === "expense") {
    const txDate = new Date(t.date).toISOString().split("T")[0];

    const found = last30Days.find((d) => d.date === txDate);
    if (found) {
      found.spent += Number(t.amount);
    }
  }
});

const dailyData = last30Days;

// 📊 SIMPLE ANALYTICS INSIGHTS

// highest spending day
const highestDay = dailyData.reduce(
  (max, d) => (d.spent > max.spent ? d : max),
  { day: "-", spent: 0 }
);

// average spending
const totalSpentLast30 = dailyData.reduce((sum, d) => sum + d.spent, 0);
const avgSpending = Math.round(totalSpentLast30 / dailyData.length);

const budgetUsedPercent = Math.min(
  (stats.totalSpent / stats.monthlyBudget) * 100,
  100
);
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 p-6">
        <h2 className="text-xl font-bold mb-6">ExpenseAI</h2>

        <p className="text-sm text-gray-400 mb-6">
          {user?.name}
          <br />
          {user?.email}
        </p>

        {[
          ["dashboard", "Dashboard", PieChart],
          ["transactions", "Transactions", CreditCard],
          ["insights", "AI Insights", Brain],
          ["budget", "Budget", Target],
          ["analytics", "Analytics", TrendingUp]
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex gap-3 px-4 py-3 rounded mb-2 ${
              activeTab === id ? "bg-purple-600" : "text-gray-400"
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}

        <button onClick={logout} className="mt-6 text-red-400 flex gap-2">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="ml-64 p-6 space-y-6">
        {notifications.length > 0 && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded">
            <h3 className="font-bold mb-2">Notifications</h3>
            {notifications.map((n) => (
              <p key={n._id}>• {n.message}</p>
            ))}
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-4 gap-4">
              <Card title="Total Spent" value={`₹${stats.totalSpent}`} />
              <Card title="Budget Left" value={`₹${stats.budgetRemaining}`} />
              <Card title="Total Budget" value="₹50,000" />
              <div
                onClick={() => setShowAddExpense(true)}
                className="bg-purple-600 p-6 rounded cursor-pointer"
              >
                <p>Add Expense</p>
                <h3 className="text-xl font-bold">Quick Add</h3>
              </div>
            </div>

            {stats.totalSpent > alertBudget && (
              <div className="bg-red-500/20 border border-red-500 p-4 rounded">
                🚨 Budget Breach: crossed ₹{alertBudget}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <ChartCard title="Last 30 Days Spending Trend">
  <ResponsiveContainer height={300}>
    <LineChart data={dailyData}>
      <XAxis 
  dataKey="day"
  angle={-15}
  textAnchor="end"
  interval={4}
/>
      <YAxis />
      <Tooltip />
      <Line 
        dataKey="spent" 
        stroke="#a855f7" 
        strokeWidth={2} 
      />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
            

             
              <ChartCard title="Categories">
  <ResponsiveContainer height={250}>
    <RePieChart>
      <Pie
        data={categoryData}
        dataKey="value"
        outerRadius={100}
        label={({ name, x, y }) => (
          <text
            x={x}
            y={y}
            fill="#fff"
            fontSize={10}
            textAnchor="middle"
          >
            {name}
          </text>
        )}
      >
        {categoryData.map((c, i) => (
          <Cell key={i} fill={c.color} />
        ))}
      </Pie>
      <Tooltip />
    </RePieChart>
  </ResponsiveContainer>
</ChartCard>
              </div>

               <div className="grid grid-cols-1 gap-6">
              <ChartCard title="Category-wise Spending">
  <ResponsiveContainer height={300}>
    <BarChart data={categoryData}  >
      <XAxis 
  dataKey="name"
  // angle={-0}
  textAnchor="end"
  interval={0}
  tick={{ fontSize: 12 }}
/>
      <YAxis />
      <Tooltip />
      <Bar dataKey="value">
        {categoryData.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
            </div>
          </>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" &&
          transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex justify-between bg-slate-800 p-4 rounded"
            >
              <div>
                <p>{tx.description}</p>
                <p className="text-gray-400">{tx.category}</p>
              </div>
              <div className="flex gap-4">
                ₹{tx.amount}
                <Trash2
                  onClick={() => handleDelete(tx._id)}
                  className="cursor-pointer text-red-400"
                />
              </div>
            </div>
          ))}

        {/* AI INSIGHTS */}
        {activeTab === "insights" && (() => {

  // 🔥 Calculate highest category correctly
  const highestCategory = Object.entries(stats.categoryBreakdown).reduce(
    (max, [category, amount]) => {
      return amount > max.amount
        ? { name: category, amount }
        : max;
    },
    { name: "N/A", amount: 0 }
  );

  return (
    <div className="space-y-3 bg-slate-800 p-6 rounded">
      <p>
        🤖 Your highest spending category is{" "}
        <b>{highestCategory.name}</b>
      </p>
      <p>📊 You spent ₹{stats.totalSpent} this month</p>
      <p>⚠️ Budget alert is set at ₹{alertBudget}</p>
      <p>💡 Consider reducing <b>{highestCategory.name}</b> expenses</p>
      <p>📈 Your spending shows noticeable variations, indicating irregular expense patterns</p>
      <p>
        📅 Highest spending day: <b>{highestDay.day}</b> (₹{highestDay.spent})
      </p>
      <p>
        📊 Average daily spending: <b>₹{avgSpending}</b>
      </p>

    </div>
    
  );

})()}
        {/* BUDGET */}
        {activeTab === "budget" && (
          <div className="bg-slate-800 p-6 rounded space-y-4">
            <p>Total Budget: ₹50,000</p>
            <p>Alert Budget: ₹{alertBudget}</p>
            <p>Spent: ₹{stats.totalSpent}</p>

            {stats.totalSpent > alertBudget && (
              <p className="text-red-400">🚨 Budget breached</p>
            )}
          </div>
        )}

        {/* ANALYTICS */}
{activeTab === "analytics" && (
  <div className="space-y-4">

    {/* MINI STATS FIRST */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-800 p-4 rounded">
        <p className="text-gray-400 text-sm">Highest Day</p>
        <p className="text-lg font-bold">₹{highestDay.spent}</p>
      </div>

      <div className="bg-slate-800 p-4 rounded">
        <p className="text-gray-400 text-sm">Avg Daily</p>
        <p className="text-lg font-bold">₹{avgSpending}</p>
      </div>
    </div>

    {/* BUDGET USAGE */}
    <div className="bg-slate-800 p-4 rounded">
      <p className="mb-2">💰 Budget Usage</p>

      <div className="w-full bg-slate-700 h-3 rounded">
        <div
          className="h-3 bg-purple-500 rounded"
          style={{ width: `${budgetUsedPercent}%` }}
        ></div>
      </div>

      <p className="mt-2 text-sm text-gray-400">
        {Math.round(budgetUsedPercent)}% of budget used
      </p>
    </div>

    {/* LINE CHART LAST */}
    <ChartCard title="Last 30 Days Spending Trend">
      <ResponsiveContainer height={300}>
        <LineChart data={dailyData}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line dataKey="spent" stroke="#a855f7" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

  </div>
  
  
)}


 </div>       
      {/* ADD EXPENSE MODAL */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded w-96">
            <input
              placeholder="Description"
              className="w-full mb-3 bg-slate-700 px-3 py-2"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full mb-3 bg-slate-700 px-3 py-2"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
            />
            <button
              onClick={handleAddExpense}
              disabled={aiLoading}
              className={`w-full py-2 rounded ${
                aiLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600"
              }`}
            >
              {aiLoading ? "Categorizing with AI..." : "Add Expense"}
            </button>
          </div>
        </div>
      )}

      {/* 💬 FLOATING BUTTON */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-purple-600 p-4 rounded-full shadow-lg hover:bg-purple-700 z-50"
      >
        💬
      </button>

      {/* 💬 CHAT POPUP */}
      {showChat && (
        <div className="fixed bottom-20 right-6 w-80 bg-slate-800 p-4 rounded shadow-lg space-y-3 z-50">
          <div className="flex justify-between">
  <p className="font-semibold">AI Assistant</p>

  <button
    onClick={() => {
      setShowChat(false);
      setChatInput("");
      setChatResponse("");
    }}
  >
    ✖
  </button>
</div>
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-700 rounded"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />

          <button
            onClick={handleChatQuery}
            className="bg-purple-600 px-4 py-2 rounded w-full"
          >
            Ask
          </button>

          {chatResponse && (
            <div className="bg-slate-700 p-3 rounded text-sm">
              🤖 {chatResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-slate-800 p-6 rounded">
    <p className="text-gray-400">{title}</p>
    <h3 className="text-xl font-bold">{value}</h3>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-slate-800 p-6 rounded">
    <h3 className="mb-4 font-semibold">{title}</h3>
    {children}
  </div>
);



export default Dashboard;

