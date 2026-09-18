# Krishi Bazaar — Direct Farm-to-Market Platform with Smart Logistics

> **Smart India Hackathon (SIH 2026) Prototype**  
> *"Connecting farmers and buyers through direct agricultural trade, bulk supply aggregation, market intelligence, demand forecasting, and efficient logistics planning."*

---

## 1. Executive Summary & Core USP

**Krishi Bazaar** addresses critical inefficiencies in traditional agricultural supply chains:
1. **Limited Direct Access:** Smallholder farmers struggle with exploitative intermediaries and non-transparent pricing.
2. **The Bulk Procurement Dilemma:** Large food processors, wholesalers, and retail chains need large volumes (e.g., 10,000 kg of Wheat), which no single small farmer can supply alone.
3. **Logistics Chaos:** Fragmented collections across rural Mandis result in empty truck kilometers, high freight overhead, and spoilage.
4. **Demand & Price Volatility:** Sowing and procurement decisions lack predictive decision support.

### The Krishi Bazaar Solution:
```
ONE BULK BUYER
      ↓
MULTIPLE FARMERS / FPOs
      ↓
SMART SUPPLY AGGREGATION
      ↓
ONE CONSOLIDATED ORDER
      ↓
TRANSPARENT PRICING BREAKDOWN
      ↓
DISTANCE-BASED ROUTE OPTIMIZATION
      ↓
COORDINATED PICKUP & DELIVERY
```

---

## 2. Platform Roles (Strictly 3 Primary Roles)

In accordance with SIH requirements, the platform enforces only **3 primary user roles**:
1. **FARMER / FPO:** Publish agricultural produce listings, review incoming matched demand, monitor orders, and receive direct crop-specific market signals.
2. **BUYER / CONSUMER:** A unified role that can execute:
   - **Normal Purchase:** Spot purchase of smaller quantities (e.g. 10 kg Rice) from the direct marketplace.
   - **Post Bulk Requirement:** Submit high-tonnage procurement requests (e.g. 10,000 kg Wheat or Mustard) to trigger smart multi-farmer aggregation.
3. **ADMIN:** Platform-wide oversight of GMV, listed capacity, active matches, user registries, and logistics pipelines.

---

## 3. Multi-Category Agricultural Coverage (Not Vegetable-Only)

Krishi Bazaar supports an extensible, dynamic agricultural catalog:
- **Grains:** Wheat, Rice, Maize
- **Oilseeds:** Mustard, Soybean, Groundnut
- **Pulses:** Chickpea, Lentil, Pigeon Pea
- **Vegetables:** Potato, Tomato, Onion
- **Other Produce:** Custom Produce & Jaggery

*All marketplace filters, supply matching, pricing formulas, demand forecasting, and market intelligence update dynamically based on the selected produce.*

---

## 4. Technology Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts
- **Optimization & Routing:** Haversine Great-Circle Geodesic Distance + Nearest-Neighbor Heuristic (Adjusted for UP road topologies)
- **Demand Forecasting (Core AI):** Least-Squares Linear Trend Regression with Seasonal Agricultural Multipliers
- **Price Intelligence:** 3-Period Weighted Moving Average (WMA) + Momentum Trend Estimation
- **AI Assistant Layer:** Google Gemini API integration with an explainable fallback intelligence engine
- **Database & Auth:** Firebase Auth & Firestore with an automatic **Instant Prototype Demo Mode** (in-memory & localStorage reactive store seeded with realistic Uttar Pradesh agricultural clusters)
- **Deployment:** Vercel SPA Ready (`vercel.json` rewrite configuration)

---

## 5. SIH 2026 Judge Demo Flow (Step-by-Step)

The application includes a prominent top **"Quick Role Switcher"** allowing judges to evaluate the entire pipeline in under 3 minutes:

| Step | Action | Feature Highlighted |
|---|---|---|
| **1** | Open Krishi Bazaar landing page | Hero, Tagline, Problem $\rightarrow$ Solution Matrix, 6-Stage Pipeline |
| **2** | Switch to **Farmer A (Prayagraj)** | Farmer Dashboard: Active Listings, Available Produce, "Add Produce" form |
| **3** | View Wheat Supply Listings | Farmer A (3,000 kg), Farmer B (2,500 kg), Farmer C (4,500 kg) |
| **4** | Switch to **Consumer (Sunita)** | Normal Purchase: Buy 10 kg Rice at ₹42/kg $\rightarrow$ Instant Order Confirmed |
| **5** | Switch to **Bulk Buyer (Avadh Agro)** | Open **Post Bulk Requirement** |
| **6** | Load Demo 1: Wheat 10,000 kg | Smart Supply Matching: Pools Farmer A (3,000 kg) + Farmer B (2,500 kg) + Farmer C (4,500 kg) |
| **7** | Review Aggregation Breakdown | **100% Fulfilled**, 0 kg remaining, 3 contributing farmers |
| **8** | Load Demo 2: Mustard 10,000 kg | **Partial Matching Proof:** 7,000 kg available (70% fulfilled, 3,000 kg remaining). Never fakes 100%! |
| **9** | Click "Confirm Aggregation & Create Order" | Converts matched allocations into an order |
| **10** | Review Transparent Pricing | Farmer Produce Value (₹270,000) + Logistics Freight (₹8,000) + Platform Fee (₹2,000) = Total ₹280,000 |
| **11** | Inspect Interactive Status Controller | Step from `Matched` $\rightarrow$ `Order Confirmed` $\rightarrow$ `Pickup Planned` $\rightarrow$ `In Transit` $\rightarrow$ `Delivered` |
| **12** | Open **Smart Logistics** | Distance-Based Route Optimization: Sequence Prayagraj $\rightarrow$ Kanpur $\rightarrow$ Unnao $\rightarrow$ Lucknow destination on the interactive route map |
| **13** | Open **Market Intelligence** | Dynamic crop selector: Select **Wheat** (Bullish trend, +7.4%), switch to **Rice** (+25%), switch to **Mustard** (+15%). Proves system is not vegetable-only |
| **14** | Click "Ask Krishi AI" | Gemini explanation layer grounding why mustard or wheat demand is rising |
| **15** | Switch to **Admin** | Review total volume, active listings, and platform GMV |

---

## 6. AI & Algorithmic Implementation Details

### A. Core AI — Demand Forecasting
- **Method:** Least-Squares Linear Trend Regression applied over a 6-month historical time series:
  $$\text{Slope } m = \frac{n\sum(xy) - \sum x \sum y}{n\sum(x^2) - (\sum x)^2}$$
  $$\text{Intercept } b = \frac{\sum y - m\sum x}{n}$$
- **Seasonality Adjustment:** Incorporates crop-specific seasonal weightings (e.g. 1.18 for festival rice surge, 1.15 for rabi crushing mustard buffer acquisitions).
- **Output:** Current demand (kg), forecast demand (kg), percentage delta, and Recharts dual-bar visualization.

### B. Supporting Intelligence — Price Intelligence
- **Method:** 3-Period Weighted Moving Average (WMA) combined with directional momentum regression:
  $$\text{WMA} = \frac{1 \cdot P_{t-2} + 2 \cdot P_{t-1} + 3 \cdot P_t}{6}$$
- **Transparency Disclosure:** Explicitly labeled as *"Estimated Market Trend"* / *"AI-Assisted Signal"*, preventing false promises of guaranteed prices.

### C. Optimization — Distance-Based Route Optimization
- **Formula:** Haversine formula calculating Great-Circle spherical distance between farm nodes:
  $$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
  $$d = 2R \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a}) \times 1.25 \text{ (road topology coefficient)}$$
- **Heuristic:** Nearest-Neighbor sequencing sweeping inward from the farthest agricultural hub (Prayagraj) along the highway corridor (Kanpur, Unnao) to the destination terminal (Lucknow).

### D. Gemini AI Assistant Layer
- Grounds inquiries in real structured dataset context (spot price, supply liquidity, and Mandi factors) with a built-in offline explanation fallback.

---

## 7. Local Setup & Build Instructions

### Prerequisites
- Node.js 18+ and npm installed.

### Installation
```bash
git clone <repo-url>
cd krishi-bazaar
npm install
```

### Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*Note: The platform is architected to work 100% out-of-the-box in **Prototype Demo Mode** even without any API keys.*

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

---

## 8. Vercel Deployment

Krishi Bazaar is pre-configured with `vercel.json` for seamless Single Page Application (SPA) routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy via Vercel CLI:
```bash
npx vercel
```
Or connect your GitHub repository directly to Vercel. Set the build command to `npm run build` and output directory to `dist`.

---

## 9. Future Scope
- Transporter bidding marketplace and fleet telematics.
- Multilingual voice assistance (Hindi, Awadhi, Bhojpuri).
- Mandi e-NAM API live synchronization.
- Automated sensor-based moisture testing IoT integration.

---

**SIH 2026 Team Krishi Bazaar**  
*Direct Farm-to-Market Platform with Smart Logistics*
