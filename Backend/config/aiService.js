import { pipeline } from "@xenova/transformers";

let embedder;
let categoryVectors = null;

// Category meanings (NO merchant names, NO rules)
const CATEGORIES = {
  "Food & Dining":
    "Eating food, restaurants, cafes, fast food, meals, beverages",
  "Transportation":
    "Travel, commuting, fuel, taxi, bus, train, ride services",
  "Bills & Utilities":
    "Electricity bill, gas bill, water bill, internet, mobile recharge",
  "Investment":
    "Savings, SIP, mutual fund, stocks, financial investment",
  "Shopping":
    "Buying products, clothes, electronics, personal items,phone",
  "Entertainment":
    "Movies, music, OTT subscriptions, games, Netfix , hotstar , prime video",
  "Rent":
    "House rent, accommodation payment",
  "HealthCare":
    "Healthcare: medical or health-related expenses like doctor visits, medicines, tests, hospital care, or treatment."

};

// Cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

// 🔥 Precompute category vectors ONCE
async function getCategoryVectors() {
  if (categoryVectors) return categoryVectors;

  const model = await getEmbedder();
  categoryVectors = {};

  for (const [category, text] of Object.entries(CATEGORIES)) {
    const output = await model(text, {
      pooling: "mean",
      normalize: true
    });

    // ✅ Correct extraction
    categoryVectors[category] = Array.from(output.data);
  }

  return categoryVectors;
}

export async function categorizeExpense(text = "") {
  if (!text) return "Others";

  const model = await getEmbedder();
  const categories = await getCategoryVectors();

  const expenseOutput = await model(text, {
    pooling: "mean",
    normalize: true
  });

  const expenseVector = Array.from(expenseOutput.data);

  let bestCategory = "Others";
  let bestScore = 0;

  for (const [category, vector] of Object.entries(categories)) {
    const score = cosineSimilarity(expenseVector, vector);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Confidence gate
  if (bestScore < 0.3) return "Others";

  return bestCategory;
}

