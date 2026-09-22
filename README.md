# SkillSwap — Creator Gig Marketplace

**Official Hackathon Submission**  
**Hackathon ID:** `AZIS-DGFPCR`  
**Track:** Track 2 – Web Product  
**Live Production App:** [https://skillswap-9r3r.onrender.com](https://skillswap-9r3r.onrender.com)  
**GitHub Repository:** [https://github.com/akashsingg2005/skillswap.git](https://github.com/akashsingg2005/skillswap.git)

---

> [!IMPORTANT]
> **Authentication Requirement Note for Graders**  
> Under official hackathon requirements, **authentication, login, signup, passwords, JWT, and protected user accounts are intentionally NOT implemented**. This ensures hackathon graders can immediately test and evaluate every feature (posting gigs, booking services, accepting/declining requests, completing projects, client ratings, Razorpay test payments) without creating an account. Client and creator identities are captured via standard form fields and tracked locally.

---

## 🌟 Overview

**SkillSwap** is a full-stack creator gig marketplace designed for young creators (developers, designers, video editors, writers, photographers, digital marketers) to list their skills and services, while allowing clients to seamlessly discover, book, rate, and pay for services.

---

## 🚀 Key Features

1. **Post a Gig:** Creators can list services with custom skill tags, pricing in INR, category, and descriptions. Gigs are immediately indexed for instant search.
2. **Marketplace & SkillMatch Engine:** Interactive 3-column desktop marketplace with real-time search, category filters, dynamic sorting, and **🏆 Total Completed Projects** social proof badges.
3. **Frictionless Booking & Razorpay Checkout:** Seamless booking flow capturing client requirements and preferred dates with Razorpay Test Mode integration and signature verification.
4. **Creator Dashboard & Project Lifecycle:** Metrics hub displaying Total Gigs, Pending Requests, Accepted Bookings, Completed Projects, Declined Requests, and Total Earnings with one-click **[✓ Accept]**, **[✕ Decline]**, and **[🎉 Mark Completed & Delivered]** buttons.
5. **My Bookings, Refunds & Client Ratings:** Dedicated client hub tracking booking statuses. Declined bookings display an automatic refund notice (`💳 Refund Status: Processed Automatically`), while completed bookings unlock an interactive **⭐ 5-Star Rating & Written Review** submission form.

---

## 💡 Implemented Decision Points

- **DP1 — Rejection, Refund Notice & "Find Similar Creators":** When a creator declines a request, the client sees a clear `Declined` status banner with creator reason, an explicit refund statement (*"Your payment of ₹[Rate] will be automatically refunded back to the same account within 3–5 business days"*), and a **[Find Similar Creators]** CTA that pre-filters marketplace recommendations.
- **DP2 — Double Booking Guard & Service Lifecycle:** Multiple requests can remain `Pending` for a gig, but accepting one request automatically declines competing pending requests on the backend with an **HTTP 409 Conflict** guard. Upon delivery, creator marks the project `Completed`, which increments the creator's total completed projects counter and re-opens availability for new bookings.
- **DP3 — Intelligent Discovery (SkillMatch Engine & Social Proof):** Algorithmic scoring system (`services/matchingService.js`) ranking gigs (0–100%) based on category fit, skill vector alignment, search relevance, price suitability, and rating. Features **🏆 Total Completed Projects** badges on gig cards and profiles.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Glassmorphism & Responsive Design System), Vanilla JavaScript (ES6+), Fetch API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose ORM.
- **Payments:** Razorpay Test Mode SDK & Server-side Cryptographic Signature Verification.
- **Environment:** `dotenv` configuration.

---

## 📋 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/gigs` | Fetch all gigs (supports `search`, `category`, `sort`, `skills`) |
| `GET` | `/api/gigs/:id` | Get single gig details with SkillMatch score |
| `POST` | `/api/gigs` | Create a new service gig |
| `POST` | `/api/bookings` | Create a new booking request |
| `GET` | `/api/bookings` | Fetch bookings (filter by `email` or `gigId`) |
| `GET` | `/api/bookings/:id` | Get single booking details |
| `PATCH` | `/api/bookings/:id/accept` | Accept booking (**DP2 Double Booking Guard**) |
| `PATCH` | `/api/bookings/:id/decline` | Decline booking (**DP1 Rejection Action**) |
| `PATCH` | `/api/bookings/:id/complete` | Mark booking completed & delivered (Increments project count & unlocks gig) |
| `PATCH` | `/api/bookings/:id/rate` | Submit 1-5 star rating & review for completed booking |
| `POST` | `/api/payments/create-order` | Create Razorpay payment order |
| `POST` | `/api/payments/verify` | Server-side Razorpay signature verification |
| `GET` | `/api/match` | SkillMatch recommendation engine endpoint |

---

## ⚙️ Local Setup & Environment Variables

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/akashsingg2005/skillswap.git
cd skillswap
npm install
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables
Create a `.env` file inside `backend/` based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skillswap
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> [!NOTE]
> *If Razorpay keys are omitted in `.env`, the platform automatically operates in **Test Demo Fallback Mode** so payment testing is smooth and never blocks graders.*

### 3. Start Server
```bash
npm start
```
Visit `http://localhost:5000` or open `frontend/index.html` in your web browser.

---

## 📁 Project Architecture

```
SkillSwap/
├── frontend/
│   ├── favicon.png        (Brand Favicon)
│   ├── index.html         (Marketplace Homepage & 3-Column Grid)
│   ├── post-gig.html       (Post a Gig Form)
│   ├── gig-details.html   (Gig View, Booking Modal & Recommendations)
│   ├── dashboard.html     (Creator Dashboard & Project Metrics)
│   ├── bookings.html      (My Bookings, Refund Notices & Rating Form)
│   ├── css/
│   │   ├── style.css       (Global Design System & Completed Badges)
│   │   ├── dashboard.css   (Dashboard & Request Cards)
│   │   └── responsive.css  (Strict Desktop 3-Col & Mobile Breakpoints)
│   └── js/
│       ├── api.js         (Fetch API Client Wrapper)
│       ├── app.js         (Global Navigation, Typing Effect & Toast Notifications)
│       ├── gigs.js        (Marketplace, Search & SkillMatch Filtering)
│       ├── booking.js     (Booking Modal, Details View & Similar Gigs)
│       ├── dashboard.js   (Accept/Decline/Complete Handlers & Star Rating UI)
│       └── payment.js     (Razorpay Checkout & Verification)
├── backend/
│   ├── models/
│   │   ├── Gig.js         (Mongoose Gig Schema & completedProjects Field)
│   │   └── Booking.js     (Mongoose Booking Schema, Rating & Review)
│   ├── routes/
│   │   ├── gigRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── matchRoutes.js
│   ├── controllers/
│   │   ├── gigController.js
│   │   ├── bookingController.js (Accept, Decline, Complete & Rate Handlers)
│   │   ├── paymentController.js
│   │   └── matchController.js
│   ├── services/
│   │   └── matchingService.js (SkillMatch Discovery Engine)
│   ├── config/
│   │   └── db.js          (MongoDB Atlas & Local Connection)
│   ├── seed/
│   │   └── seedData.js    (Sample Marketplace Gigs)
│   ├── package.json
│   └── server.js          (Express Application Server)
├── .gitignore
├── README.md              (Submission Documentation)
└── DECISIONS.md           (Technical Decision Points Explanation)
```
