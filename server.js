import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const balances = {}; // { wallet: balance }

function randomPrize() {
  const roll = Math.random();
  if (roll < 0.25) {
    return [true, [1500, 2000, 3000][Math.floor(Math.random() * 3)]];
  } else {
    return [false, [100, 200, 300, 500, 700][Math.floor(Math.random() * 5)]];
  }
}

app.post("/deposit", (req, res) => {
  const { wallet, amount } = req.body;
  if (!wallet || !amount) return res.status(400).json({ error: "Missing wallet or amount" });
  balances[wallet] = (balances[wallet] || 0) + amount;
  res.json({ success: true, balance: balances[wallet] });
});

app.post("/spin", (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "Missing wallet" });
  if (!balances[wallet] || balances[wallet] < 1000) return res.status(400).json({ error: "Insufficient funds" });

  balances[wallet] -= 1000;
  const [win, prize] = randomPrize();
  balances[wallet] += prize;
  res.json({ win, prize, newBalance: balances[wallet] });
});

app.post("/withdraw", (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "Missing wallet" });
  const amount = balances[wallet] || 0;
  balances[wallet] = 0;
  // Tu można dodać logikę wysyłki tokenów na Solanie
  res.json({ success: true, sent: amount });
});

app.get("/balance/:wallet", (req, res) => {
  const wallet = req.params.wallet;
  res.json({ balance: balances[wallet] || 0 });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
