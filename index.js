const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

/* ================= HEALTH API ================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

/* ================= HELPER FUNCTIONS ================= */
const fibonacci = (n) => {
  let a = 0, b = 1, result = [];
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

/* ================= BFHL API ================= */
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    // Exactly ONE key allowed
    if (keys.length !== 1) throw new Error("Invalid input");

    const key = keys[0];
    let data;

    switch (key) {

      case "fibonacci":
        if (typeof body.fibonacci !== "number") throw new Error();
        data = fibonacci(body.fibonacci);
        break;

      case "prime":
        if (!Array.isArray(body.prime)) throw new Error();
        data = body.prime.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body.lcm)) throw new Error();
        data = body.lcm.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        if (!Array.isArray(body.hcf)) throw new Error();
        data = body.hcf.reduce((a, b) => gcd(a, b));
        break;

      case "AI":
  if (typeof body.AI !== "string") throw new Error();

  const aiResponse = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: body.AI }]
        }
      ]
    },
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  const text =
    aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty AI response");

  data = text.trim().split(" ")[0].replace(".", "");
  break;



      default:
        throw new Error();
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (error) {

  // 👇 TEMPORARY DEBUG (ADD THIS LINE)
  console.log(error.response?.data || error.message);

  res.status(400).json({
    is_success: false,
    official_email: EMAIL
  });
}

});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
