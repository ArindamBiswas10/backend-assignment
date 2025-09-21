# Stocky Backend Assignment

## Project Overview
**Stocky** is a hypothetical platform where users can earn shares of Indian stocks as rewards.  
This backend project implements APIs to:

- Record stock rewards (`POST /reward`)
- Fetch today's rewards (`GET /today-stocks/:userId`)
- View user portfolio (`GET /portfolio/:userId`)

Technologies used: **Node.js, Express, Prisma, PostgreSQL**

---

## Folder Structure

backend-assignment/
│
├─ src/
│ ├─ server.js # Express server & API routes
│ ├─ priceWorker.js # Updates stock prices periodically
│
├─ prisma/
│ ├─ schema.prisma
│
├─ .env.example
├─ package.json
└─ README.md


---

## Setup Instructions

1. **Clone the repository**

git clone https://github.com/<your-username>/backend-assignment.git
cd backend-assignment
Install dependencies


npm install
Configure environment variables

Update DB credentials:

DATABASE_URL="postgresql://username:password@localhost:5432/stocky?schema=public"
PORT=3000
Run Prisma migrations


npx prisma migrate dev
npx prisma db seed   # optional
Start the server

npm run dev
Start the price worker

npm run worker
API Endpoints
1️⃣ POST /reward
Record a stock reward for a user.

Request Body

{
  "userId": "1",
  "symbol": "RELIANCE",
  "quantity": "5.25",
  "idempotencyKey": "r1"
}
Response

{
  "id": "694c66d3-aaf2-43ac-81b0-d89641db7802",
  "userId": "1",
  "symbol": "RELIANCE",
  "quantity": "5.25",
  "rewardTimestamp": "2025-09-20T11:01:22.526Z",
  "status": "COMPLETED"
}
2️⃣ GET /today-stocks/:userId
Fetch all rewards given to the user today.

Response

{
  "date": "2025-09-20",
  "rewards": [
    {
      "id": "694c66d3-aaf2-43ac-81b0-d89641db7802",
      "symbol": "RELIANCE",
      "quantity": "5.25"
    }
  ],
  "aggregatedBySymbol": {
    "RELIANCE": "5.25"
  }
}
3️⃣ GET /portfolio/:userId
Get the user's current holdings and INR valuation.

Response


{
  "holdings": [
    {
      "symbol": "RELIANCE",
      "quantity": "5.25",
      "lastPrice": "609.23",
      "valueINR": "3198.46"
    }
  ],
  "totalINR": "3198.46"
}
Notes / Edge Cases
Idempotency: idempotencyKey ensures duplicate rewards are ignored.

Price updates: priceWorker.js updates stock prices periodically.

Decimals: Quantities → NUMERIC(18,6), INR → NUMERIC(18,4).

Edge Cases:

Stock splits, delisting

Price API downtime / stale data

Reward adjustments / refunds

Screenshots
Reward
<img width="1910" height="1199" alt="Screenshot 2025-09-20 163213" src="https://github.com/user-attachments/assets/a1e4f989-0754-4a41-a97a-533c351f66b3" />
User Today Stocks
<img width="1315" height="1083" alt="Screenshot 2025-09-20 163327" src="https://github.com/user-attachments/assets/3dd85971-4d44-42d4-ba24-030300072c79" />
Portfolio
<img width="1365" height="1138" alt="Screenshot 2025-09-20 163510" src="https://github.com/user-attachments/assets/c9ea95ec-7c1f-4397-be9f-8ba7f2c6c3c7" />




Backend server + worker running

APIs tested via Postman and all routes checked

Screenshots attached 

