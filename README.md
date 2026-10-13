# RaftBites - Order Management & Real-Time Tracking

> Built for the **RaftLabs Senior Full Stack Developer Assessment**.  
> A food delivery order management feature with live menu exploration, cart management, checkout with validation, and **real-time order status tracking** powered by **Server-Sent Events (SSE)** and **Test-Driven Development (TDD)**.

---

## 🌟 Live Demo & Repository
- **Live Hosted Application**: [Deploy on Vercel](https://vercel.com) *(See deployment guide below)*
- **GitHub Repository**: [https://github.com/Kanth69/raftlabs-order-management](https://github.com/Kanth69/raftlabs-order-management)
- **Loom Walkthrough Video**: 12–15 min video walkthrough *(See recording outline below)*

---

## 🚀 Key Features

### 1. Menu Display
- Gourmet menu featuring **Artisanal Pizzas**, **Smash Burgers**, **Sides & Drinks**, and **Desserts**.
- Categorized navigation with real-time text search.
- Each item includes:
  - Name, Description, and Price (₹ INR)
  - High-resolution photography
  - Category, Dietary badges (Veg / Non-Veg)
  - Chef prep time and customer rating

### 2. Order Placement & Cart Management
- Interactive **Cart Drawer** allowing users to review selected items, adjust quantities, or remove items.
- Subtotal, tax calculation, and free delivery promotion.
- **Cart persistence** across page reloads using synchronized browser storage.
- Backend price security: prices and grand totals are verified and calculated **server-side**, preventing client-side price tampering.

### 3. Checkout with Robust Validation
- Checkout modal capturing **Full Name**, **Delivery Address**, and **Phone Number**.
- Dual-layer validation (Client-side instant feedback + Server-side Zod schema validation).
- RegEx phone number validation (7–15 digits) and address minimum length checks.

### 4. Real-Time Order Status Tracker
- 4-stage lifecycle state machine:
  $$\text{Order Received} \longrightarrow \text{Preparing} \longrightarrow \text{Out for Delivery} \longrightarrow \text{Delivered}$$
- **Server-Sent Events (SSE)** endpoint (`/api/orders/[id]/stream`) streaming live updates to the client.
- **Visual Progress Stepper** with pulsing active stage, timestamps for each stage reached, and delivery details receipt.
- **Reviewer Fast-Forward Controls**: buttons allowing reviewers to manually advance order status instantly for quick assessment.
- **Order History Modal**: allows browsing previous orders and tracking any ongoing delivery with one click.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Full-stack architecture, unified TypeScript types, zero CORS issues, 1-click Vercel deployment. |
| **Language** | **TypeScript (Strict)** | End-to-end type safety shared between frontend and backend. |
| **Styling** | **Tailwind CSS + Lucide Icons** | Modern, responsive, mobile-first design. |
| **Validation** | **Zod** | Declarative schema validation on both client and server. |
| **Real-Time Stream** | **Server-Sent Events (Web Streams API)** | Native HTTP streaming, firewall friendly, low overhead compared to WebSockets for unidirectional server-to-client updates. |
| **Testing (TDD)** | **Vitest + React Testing Library** | Fast ESM-native test runner with 100% Jest DOM compatibility. |

### Architectural Structure:
```
raftlabs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # REST API Endpoints
│   │   │   ├── menu/route.ts         # GET /api/menu (with category filter)
│   │   │   ├── orders/
│   │   │   │   ├── route.ts          # GET (all orders), POST (create order)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts      # GET (single order), PATCH (update status)
│   │   │   │       ├── status/route.ts # PATCH /api/orders/[id]/status
│   │   │   │       └── stream/route.ts # GET /api/orders/[id]/stream (SSE)
│   │   ├── globals.css               # Global Tailwind CSS
│   │   ├── layout.tsx                # App root layout with CartProvider
│   │   └── page.tsx                  # Home page (Menu, Hero, Trackers)
│   ├── components/                   # Modular UI Components
│   │   ├── Navbar.tsx                # Brand header, cart badge, order tracker pill
│   │   ├── MenuCard.tsx              # Food item card with quantity controls
│   │   ├── CartDrawer.tsx            # Slide-over cart manager
│   │   ├── CheckoutModal.tsx         # Delivery form with Zod validation
│   │   ├── OrderTracker.tsx          # Real-time animated timeline stepper
│   │   └── OrderHistoryModal.tsx     # Past order history viewer
│   ├── context/
│   │   └── CartContext.tsx           # Cart state, quantities & totals
│   ├── hooks/
│   │   └── useOrderTracking.ts       # Custom SSE hook with fallback
│   ├── lib/
│   │   ├── store.ts                  # In-memory store, state machine & event emitter
│   │   └── validation.ts             # Zod schemas for order & delivery inputs
│   ├── test/                         # TDD Test Suite (26 automated tests)
│   │   ├── api.test.ts               # REST API integration tests (CRUD & validation)
│   │   ├── components.test.tsx       # UI component & form validation tests
│   │   ├── setup.ts                  # Test runner setup
│   │   └── store.test.ts             # Store logic, state transitions & events
│   └── types/
│       └── index.ts                  # Shared TypeScript models
├── vitest.config.mts                 # Vitest test runner configuration
└── package.json
```

---

## 🧪 Test-Driven Development (TDD)

The codebase was developed following TDD principles. The test suite covers:
- **CRUD Operations**: Menu retrieval, category querying, order creation, order retrieval by ID, order listing.
- **Input Validation**: Empty cart prevention, phone number validation, address length check, invalid menu items.
- **Status State Machine**: Sequential status progression (`ORDER_RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`) and rejection of illegal backward transitions.
- **UI Components**: MenuCard rendering and cart toggling, CartDrawer operations, and CheckoutModal validation errors.

### Running Tests:
```bash
# Run the complete test suite
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Results:**
```
✓ src/test/store.test.ts (11 tests)
✓ src/test/api.test.ts (10 tests)
✓ src/test/components.test.tsx (5 tests)

Test Files  3 passed (3)
Tests       26 passed (26)
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu?category={category}` | Retrieves menu items. Filter by category (`Pizzas`, `Burgers`, `Sides & Drinks`, `Desserts`). |
| `POST` | `/api/orders` | Places a new order. Validates payload with Zod. Automatically starts status simulation. |
| `GET` | `/api/orders` | Retrieves all placed orders sorted by date. |
| `GET` | `/api/orders/:id` | Retrieves a specific order by ID and its status timeline. |
| `PATCH` | `/api/orders/:id/status` | Updates order status (`ORDER_RECEIVED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`). |
| `GET` | `/api/orders/:id/stream` | Server-Sent Events (SSE) live stream for real-time status updates. |

---

## 🤖 Use of AI in Development (Assessment Criterion #5)

In alignment with RaftLabs' evaluation criteria on effective AI usage:
1. **Architecture & Schema Design**: Used AI to model domain types, state machine transitions, and Zod validation schemas.
2. **TDD Test Generation**: Leveraged AI to author comprehensive edge-case tests before implementing endpoint logic (e.g. testing backward status transition rejection, malformed phone numbers, non-existent menu items).
3. **Real-Time Streaming**: Engineered Server-Sent Events (SSE) with `ReadableStream` and automatic keep-alive heartbeats to ensure compatibility with Vercel serverless execution.
4. **Developer Experience**: Added fast-forward reviewer controls to let evaluators test every state instantly.

---

## 📹 Loom Video Walkthrough Outline (12–15 Minutes)

Here is a recommended script structure for your video presentation:

1. **Introduction & Project Overview (1-2 mins)**:
   - Introduce yourself and summarize the assessment goal: building an Order Management feature with real-time tracking for a food delivery application.
2. **Architecture & Design Choices (3-4 mins)**:
   - Explain why Next.js App Router + TypeScript was chosen (single repository, full-stack, type sharing, seamless Vercel hosting).
   - Walk through the layered architecture: Routes $\rightarrow$ Service/Store $\rightarrow$ Validation $\rightarrow$ UI components.
   - Explain the state machine and how illegal status transitions are prevented.
3. **Live Feature Demo (4-5 mins)**:
   - Browse the menu, filter by categories, and search for items.
   - Add items to the cart, adjust quantities in the slide-over Cart Drawer, and observe real-time subtotal/tax calculations.
   - Proceed to checkout: demonstrate client-side and server-side validation error handling.
   - Enter valid details and submit the order.
   - Showcase the **Live Order Tracker**: explain Server-Sent Events (SSE), show the status advancing automatically, and demonstrate the fast-forward reviewer buttons.
4. **Test-Driven Development (TDD) Walkthrough (2-3 mins)**:
   - Open terminal, run `npm test`, and show all 26 passing tests.
   - Highlight API CRUD tests, validation tests, and UI component tests.
5. **AI Tools & Challenges Overcome (2-3 mins)**:
   - Explain how you used AI for rapid scaffolding, test-case authoring, and edge-case validation.
   - Discuss any challenges faced (e.g., maintaining stateful simulation in serverless, SSE connection resilience) and how you solved them.

---

## 💻 Local Setup & Execution

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd raftlabs
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run test suite:**
   ```bash
   npm test
   ```

4. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🚀 Hosting on Vercel

1. Push this repository to your public GitHub account.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `raftlabs` repository.
4. Keep default settings (`Framework: Next.js`) and click **"Deploy"**.
5. Your live application will be available within ~60 seconds!
