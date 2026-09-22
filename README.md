# SkillSwap — Creator Gig Marketplace

**Official Hackathon Submission**  
**Hackathon ID:** `AZIS-DGFPCR`  
**Track:** Track 2 – Web Product  
**Brief:** SkillSwap — Creator Gig Marketplace

---

> [!IMPORTANT]
> **Authentication Requirement Note for Graders**  
> Under official hackathon requirements, **authentication, login, signup, passwords, JWT, and protected user accounts are intentionally NOT implemented**. This ensures hackathon graders can immediately test and evaluate every feature (posting gigs, booking services, accepting/declining requests, viewing client bookings, Razorpay test payments) without creating an account. Client and creator identities are captured via standard form fields and tracked locally.

---

## 🌟 Overview

**SkillSwap** is a full-stack creator gig marketplace designed for young creators (developers, designers, video editors, writers, photographers, digital marketers) to list their skills and services, while allowing clients to seamlessly discover, book, and pay for services.

---

## 🚀 Key Features

1. **Feature 1 — Post a Gig:** Creators can list services with custom skill tags, pricing, category, and descriptions. Gigs are immediately saved to MongoDB and indexed for instant search.
2. **Feature 2 — Browse & Search Gigs:** Interactive marketplace with real-time search (across title, description, skills, and creator name), category filter pills, and dynamic sorting (Recommended, Price, Rating, Newest).
3. **Feature 3 — Book a Gig:** Frictionless booking flow collecting client details, project requirements, and service date, followed by Razorpay payment checkout.
4. **Feature 4 — Creator Dashboard:** Professional metrics hub displaying total gigs, pending requests, accepted/declined counts, and total earnings with one-click **[Accept]** and **[Decline]** action triggers.
5. **Feature 5 — My Bookings:** Dedicated client view tracking booking statuses (`Pending`, `Accepted`, `Declined`) and payment states (`Pending`, `Paid`) using client email.

---

## 💡 Implemented Decision Points

- **DP1 — Rejection & "Find Similar Creators":** When a creator declines a request, the client sees a clear `Declined` status banner with reason, and a **[Find Similar Creators]** CTA that pre-filters marketplace recommendations for matching skills and categories.
- **DP2 — Double Booking Atomic Guard:** Multiple requests can remain `Pending` for a gig, but accepting one request automatically marks all competing pending requests for that gig as `Declined` on the backend. Attempting to accept a second request returns an **HTTP 409 Conflict**.
- **DP3 — Intelligent Discovery (SkillMatch Engine):** Algorithmic scoring system (`services/matchingService.js`) that ranks gigs (0–100%) based on category exact fit, skill vector alignment, search term relevance, price suitability, and creator rating.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Creator Economy Design System), Vanilla JavaScript (ES6+), Fetch API.
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
| `GET` | `/api/bookings` | Fetch bookings (filter by `email` or get all) |
| `GET` | `/api/bookings/:id` | Get single booking details |
| `PATCH` | `/api/bookings/:id/accept` | Accept booking (**DP2 Double Booking Protection**) |
| `PATCH` | `/api/bookings/:id/decline` | Decline booking (**DP1 Rejection Action**) |
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Server-side Razorpay signature verification |
| `GET` | `/api/match` | SkillMatch recommendation engine endpoint |

---

## ⚙️ Local Setup & Environment Variables

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skillswap
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> [!NOTE]
> *If Razorpay keys are omitted in `.env`, the platform automatically operates in **Test Demo Fallback Mode** so payment testing is smooth and never blocks graders.*

### 3. Seed Initial Marketplace Data (Optional)
To populate 10 realistic creator gigs:
```bash
npm run seed
```
*(Note: The server also auto-seeds these 10 gigs if MongoDB is empty upon launch).*

### 4. Start Server
```bash
npm start
```
Visit `http://localhost:5000` in your web browser.

---

## 🚀 Deployment Instructions

- **Backend / Express App:** Deploy to **Render**, Railway, or AWS Elastic Beanstalk. Ensure `MONGODB_URI`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` are set in the hosting platform's environment settings.
- **Database:** **MongoDB Atlas** cluster.
- **Frontend:** Static files are served directly by Express (`app.use(express.static('public'))`).

---

## 📁 Project Architecture

```
SkillSwap/
├── public/
│   ├── index.html         (Marketplace Homepage)
│   ├── post-gig.html       (Post a Gig Form)
│   ├── gig-details.html   (Gig View & Booking Modal)
│   ├── dashboard.html     (Creator Dashboard)
│   ├── bookings.html      (My Bookings & DP1 Rejection Banner)
│   ├── css/
│   │   ├── style.css       (Global Design System)
│   │   ├── dashboard.css   (Dashboard & Request Cards)
│   │   └── responsive.css  (Mobile & Tablet Breakpoints)
│   └── js/
│       ├── api.js         (Fetch API Client Wrapper)
│       ├── app.js         (Global Toasts & Email Helper)
│       ├── gigs.js        (Marketplace & SkillMatch Filtering)
│       ├── booking.js     (Booking Modal & Form Logic)
│       ├── dashboard.js   (Accept/Decline DP1 & DP2 Handlers)
│       └── payment.js     (Razorpay Checkout & Verification)
├── models/
│   ├── Gig.js             (Mongoose Gig Schema)
│   └── Booking.js         (Mongoose Booking Schema)
├── routes/
│   ├── gigRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   └── matchRoutes.js
├── controllers/
│   ├── gigController.js
│   ├── bookingController.js
│   ├── paymentController.js
│   └── matchController.js
├── services/
│   └── matchingService.js (SkillMatch Discovery Engine)
├── config/
│   └── db.js              (MongoDB Connection)
├── seed/
│   └── seedData.js        (10 Realistic Marketplace Gigs)
├── .env.example
├── .gitignore
├── package.json
├── server.js              (Express Application Server)
├── README.md              (Submission Documentation)
└── DECISIONS.md           (Technical Decision Points Explanation)
```
