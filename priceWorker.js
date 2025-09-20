const { PrismaClient } = require("@prisma/client");
const Decimal = require("decimal.js");


const prisma = new PrismaClient();

async function tick() {
  const symbols = await prisma.rewardEvent.findMany({
    distinct: ["symbol"],
    select: { symbol: true },
  });

  for (const { symbol } of symbols) {
    const price = new Decimal((Math.random() * 3000 + 100).toFixed(2));
    await prisma.pricePoint.create({
      data: { symbol, priceINR: price, timestamp: new Date() },
    });
    console.log(`Price updated ${symbol}: ₹${price}`);
  }
}

(async () => {
  await tick();
  process.exit();
})();
