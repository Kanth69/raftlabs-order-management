# Loom Video Walkthrough Script (12–15 Minutes)

> **Role**: Senior Full Stack Developer Assessment  
> **Company**: RaftLabs  
> **Feature**: Order Management & Live Status Tracking  

Use this guide while recording your Loom screen share. It ensures you address every evaluation criterion and prompt requirement within the 12–15 minute target window.

---

## ⏱️ Timeline & Section Breakdown

| Segment | Timing | Topic | What to Show on Screen |
| :--- | :--- | :--- | :--- |
| **Part 1** | `00:00 - 02:00` | Introduction & Overview | Home page running at `localhost:3000` |
| **Part 2** | `02:00 - 06:30` | End-to-End Feature Demo | Menu $\rightarrow$ Cart $\rightarrow$ Checkout $\rightarrow$ Live SSE Tracking |
| **Part 3** | `06:30 - 09:30` | Code Architecture & Design | VS Code project tree, `store.ts`, Route Handlers |
| **Part 4** | `09:30 - 11:30` | Test-Driven Development (TDD) | Terminal running `npm test` (26 tests passing) |
| **Part 5** | `11:30 - 13:30` | Effective Use of AI Tools | Prompting, schema design, test generation |
| **Part 6** | `13:30 - 15:00` | Challenges Overcome & Closing | SSE vs WebSockets, serverless persistence |

---

## 🎬 Section-by-Section Talking Points

### Part 1: Introduction & Overview (2 mins)
- **What to say**:
  > *"Hi everyone, I’m excited to present my submission for the RaftLabs Senior Full Stack Developer Assessment. In this project, I built an end-to-end Order Management and Real-Time Tracking system for a food delivery platform called **RaftBites**.*
  >
  > *My objective was to build a clean, maintainable, production-ready solution adhering strictly to Test-Driven Development (TDD), schema validation, and real-time backend updates using Server-Sent Events (SSE). Let’s dive straight into the live application."*

---

### Part 2: End-to-End Live Application Demo (4.5 mins)
1. **Menu Display**:
   - Filter categories: Click through *All*, *Pizzas*, *Burgers*, *Sides & Drinks*, *Desserts*.
   - Use the search bar: Type "truffle" or "burger" to show instant search filtering.
   - Point out items: Name, description, pricing in Indian Rupees (`₹`), dietary tags (Veg/Non-Veg), prep times, and customer ratings.
2. **Cart Drawer**:
   - Click "Add" on a couple of items (e.g. *Artisan Margherita Pizza* and *Parmesan Truffle Fries*).
   - Open the slide-over Cart Drawer.
   - Adjust quantities using `+` and `-` buttons; show how the subtotal, 5% GST, and grand total recalculate dynamically.
3. **Checkout Validation**:
   - Click **Proceed to Checkout**.
   - Intentionally hit "Confirm & Place Order" with empty inputs to demonstrate **instant client-side Zod validation errors** (name length, address length, phone regex).
   - Enter valid details (e.g., Name: *Rahul Sharma*, Phone: *+91 98765 43210*, Address: *Flat 402, Green Glen Layout, Bellandur, Bengaluru*).
4. **Live Order Status Tracker (Real-Time SSE)**:
   - Click **Confirm & Place Order**.
   - Show the **Live Tracker modal**:
     - Point out the **"Real-Time SSE Live"** green badge.
     - Show the **4-step timeline**: `Order Received` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`.
     - Point out the backend auto-progression timer transitioning statuses every 6 seconds.
     - Highlight the **Reviewer Fast-Forward Controls**: click "Out for Delivery" or "Delivered" to show how evaluators can simulate instant state transitions without waiting.
     - Open the **Order History** modal to show that previous orders are persisted and can be re-tracked with a single click.

---

### Part 3: Architecture & Design Decisions (3 mins)
- **What to say**:
  > *"Now let's examine the codebase architecture in VS Code.*
  >
  > *1. **Tech Stack Selection**: I chose **Next.js 14 (App Router) with TypeScript and Tailwind CSS**. This combines the REST API and the React UI in a unified repository with shared TypeScript types, zero CORS headaches, and seamless 1-click deployment on Vercel.*
  >
  > *2. **Layered Separation**:*
  > - `src/app/api/*`: HTTP controllers responsible solely for receiving requests, status codes, and error formatting.
  > - `src/lib/store.ts`: Domain service layer containing the **In-Memory Store** and **State Machine** preventing invalid/backward transitions.
  > - `src/lib/validation.ts`: Centralized **Zod schemas** shared between client forms and backend route handlers.
  > - `src/components/*`: Isolated, accessible presentation components.
  >
  > *3. **Real-Time Strategy (SSE vs WebSockets)**:*
  > *I opted for **Server-Sent Events (SSE)** via Next.js Streaming API (`ReadableStream`). For food order status tracking, updates are unidirectional (server pushes to client). SSE avoids the overhead of managing stateful WebSocket TCP handshakes, works over standard HTTP, and is completely firewall- and Vercel-friendly."*

---

### Part 4: Test-Driven Development (TDD) Walkthrough (2 mins)
- **What to do on screen**:
  - Open terminal and run: `npm test`
  - Show the **26 passing tests** across all 3 test files:
    1. `src/test/store.test.ts`: Store operations, price calculations, state machine progression, event emitter subscriptions.
    2. `src/test/api.test.ts`: REST endpoints (`GET /api/menu`, `POST /api/orders`, `PATCH /api/orders/[id]/status`, 400 Bad Request validations, 404 handling).
    3. `src/test/components.test.tsx`: UI component rendering for `MenuCard`, `CartDrawer`, and form validation in `CheckoutModal`.
- **What to say**:
  > *"TDD was a foundational requirement for this assessment. I wrote unit tests for schemas, domain transitions, and API endpoints before finalizing the implementations. Notice that our test suite runs in under 3 seconds in Vitest with 100% test pass rate."*

---

### Part 5: Effective Use of AI in Development (2 mins)
- **What to say**:
  > *"As RaftLabs is an AI-first product studio, leveraging AI tools was an integral part of my workflow:*
  >
  > *1. **Schema & Domain Modeling**: I used AI to rapidly define comprehensive TypeScript interfaces and Zod schemas, ensuring strict types from DB to API to UI.*
  > *2. **Edge-Case Test Generation**: I prompted AI to suggest rigorous negative test cases—such as malformed phone numbers, empty cart submissions, non-existent menu item references, and illegal backward status transitions.*
  > *3. **Stream Architecture**: AI assisted in configuring the Next.js `ReadableStream` implementation for SSE, including keep-alive heartbeat comments to prevent serverless proxy timeouts."*

---

### Part 6: Challenges Overcome & Closing (1.5 mins)
- **What to say**:
  > *"A key challenge I anticipated was state persistence in serverless environments like Vercel. While the assessment allows an in-memory store, serverless lambdas can spin down. I addressed this with a dual approach:*
  > - *Client-side local synchronization maintains order history across sessions.*
  > - *The SSE stream includes automated heartbeat checks and client-side fallback polling if an SSE stream drops.*
  >
  > *The codebase is clean, thoroughly tested, built for scale, and ready for deployment on Vercel. Thank you for your time, and I look forward to your feedback!"*

---

## 💡 Quick Tips for a Polished Loom Recording
- Keep your camera bubble visible in the corner.
- Ensure your font size in VS Code is comfortably readable (`Ctrl + +`).
- Keep your terminal clear before running `npm test`.
- Aim for a confident, structured pace—hitting each bullet point clearly!
