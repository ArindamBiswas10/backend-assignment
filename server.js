const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Helper: mock or latest price
async function getPrice(symbol) {
  const latest = await prisma.pricePoint.findFirst({
    where: { symbol },
    orderBy: { timestamp: "desc" },
  });
  if (latest) return new Decimal(latest.priceINR);
  return new Decimal((Math.random() * 3000 + 100).toFixed(2));
}

// POST /reward
app.post("/reward", async (req, res) => {
  try {
    const { userId, symbol, quantity, idempotencyKey } = req.body;
    if (!userId || !symbol || !quantity)
      return res.status(400).json({ error: "Missing fields" });

    if (idempotencyKey) {
      const existing = await prisma.rewardEvent.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return res.json(existing);
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const reward = await prisma.rewardEvent.create({
      data: {
        userId,
        symbol,
        quantity: new Decimal(quantity),
        rewardTimestamp: new Date(),
        idempotencyKey,
      },
    });
    res.status(201).json(reward);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /today-stocks/:userId
app.get("/today-stocks/:userId", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const rewards = await prisma.rewardEvent.findMany({
    where: {
      userId: req.params.userId,
      rewardTimestamp: { gte: start, lte: end },
    },
  });

  const agg = {};
  rewards.forEach(r => {
    agg[r.symbol] = new Decimal(agg[r.symbol] || 0).plus(r.quantity).toFixed(6);
  });

  res.json({ date: start.toISOString().slice(0, 10), rewards, aggregatedBySymbol: agg });
});

// GET /portfolio/:userId
app.get("/portfolio/:userId", async (req, res) => {
  const rewards = await prisma.rewardEvent.findMany({
    where: { userId: req.params.userId },
  });

  const totals = {};
  rewards.forEach(r => {
    totals[r.symbol] = new Decimal(totals[r.symbol] || 0).plus(r.quantity);
  });

  const holdings = [];
  let totalINR = new Decimal(0);
  for (const sym of Object.keys(totals)) {
    const price = await getPrice(sym);
    const value = totals[sym].mul(price);
    totalINR = totalINR.plus(value);
    holdings.push({
      symbol: sym,
      quantity: totals[sym].toFixed(6),
      lastPrice: price.toFixed(4),
      valueINR: value.toFixed(4),
    });
  }

  res.json({ holdings, totalINR: totalINR.toFixed(4) });
});

app.listen(3000, () => console.log(" API running on http://localhost:3000"));
