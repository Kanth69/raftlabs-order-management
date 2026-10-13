# RaftLabs Assessment Submission Note

Use this template when sending your submission email or submitting via your candidate portal.

---

### **Subject**:
`Submission: Sr Full Stack Developer Assessment - [Your Full Name]`

---

### **Body**:

Dear RaftLabs Hiring Team,

I have completed the **Senior Full Stack Developer Assessment** for the **Order Management & Real-Time Tracking** feature. 

Below are the links to my code repository, live hosted application, and Loom video walkthrough:

---

### 🔗 Project Links
- **GitHub Repository**: `https://github.com/Kanth69/raftlabs-order-management`
- **Hosted Application (Vercel)**: `https://<your-project>.vercel.app`
- **Loom Video Walkthrough (12–15 mins)**: `https://www.loom.com/share/<your-video-id>`

---

### 📋 Feature Implementation & Tech Highlights
1. **Tech Stack**: Built with **Next.js 14 (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**.
2. **Menu & Cart Management**: Categorized menu, search bar, dietary indicators, quantity controls, and slide-over Cart Drawer.
3. **Checkout with Validation**: Integrated **Zod** schema validation covering customer name, full delivery address, and valid phone format.
4. **Real-Time Order Tracking**: 
   - Engineered via **Server-Sent Events (SSE)** at `/api/orders/[id]/stream` using the Web Streams API.
   - 4-step state machine (`Order Received` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`) with protection against illegal backward state transitions.
   - Includes **Reviewer Fast-Forward Controls** for instant evaluator testing without waiting for timers.
5. **Test-Driven Development (TDD)**:
   - Comprehensive test suite in **Vitest** with **26 passing tests** covering domain store logic, REST API endpoints, edge cases, and UI components.
6. **Use of AI**:
   - Leveraged AI tools for architecture design, edge-case test authoring, schema modeling, and SSE stream resilience.

A comprehensive walkthrough of the design choices, architecture, and Loom outline can also be found in the repository's `README.md` and `LOOM_WALKTHROUGH_SCRIPT.md`.

Looking forward to discussing the project with your engineering team!

Best regards,  
**[Your Full Name]**  
[Your Phone Number]  
[Your LinkedIn Profile]  
[Your Portfolio / GitHub Profile]
