# SkillSwap Technical Decision Points

**Hackathon ID:** `AZIS-DGFPCR`  
**Track:** Track 2 – Web Product  
**Project:** SkillSwap — Creator Gig Marketplace

---

## Decision Point 1 (DP1) — Rejection, Refund Notice & "Find Similar Creators"

### Question
*"What can a client see and do after a creator declines a booking request?"*

### Product Implementation & Rationale
When a creator declines a booking request on the Creator Dashboard:

1. **Status Update:** The booking status instantly changes to `Declined` on the backend, with an explicit decline reason stored (e.g., *"Creator is unavailable on requested date"*).
2. **Client Visibility & Automatic Refund Notice:** On the client's **My Bookings** page (`bookings.html`), the booking card renders a distinct red alert banner displaying:
   - Status badge: `✕ Declined`
   - Creator decline reason.
   - **💳 Refund Status Statement:** *"Your payment of ₹[Rate] will be automatically refunded back to the same bank account / payment method used during checkout within 3–5 business days."*
3. **No Dead-End Experience:** Instead of leaving the user stranded, a prominent **[🔍 Find Similar Creators]** CTA button is presented.
4. **Intelligent Recommendation Redirect:** Clicking **[Find Similar Creators]** redirects the client back to the marketplace (`index.html`), automatically applying URL query parameters (`?category=...&search=...`) that filter recommended gigs matching the category, price tier, and skills of the declined service.

---

## Decision Point 2 (DP2) — Double Booking Guard & Service Completion Lifecycle

### Question
*"Can a gig accept a new booking while another booking request is still Pending, and how is availability managed once work is completed?"*

### Product Implementation & Rationale
Multiple clients are permitted to submit booking requests for the same gig, creating multiple `Pending` requests:

$$\text{Booking A (Pending)} \quad | \quad \text{Booking B (Pending)} \quad | \quad \text{Booking C (Pending)}$$

When the creator accepts **Booking B**:

1. **Atomic Backend Guard:** The `PATCH /api/bookings/:id/accept` endpoint checks if another booking for the same `gigId` is ALREADY set to `Accepted`.
2. **Conflict Prevention (HTTP 409):** If another booking has already been accepted, the API aborts and returns `HTTP 409 Conflict` with a clear message: *"This gig has already accepted another booking request."*
3. **Single Acceptance & Auto-Sweep:** If no existing accepted booking exists:
   - **Booking B** $\rightarrow$ `Accepted`
   - **Booking A** $\rightarrow$ `Declined` (Reason: *"Creator accepted another client booking for this gig schedule."*)
   - **Booking C** $\rightarrow$ `Declined` (Reason: *"Creator accepted another client booking for this gig schedule."*)
4. **Project Completion Lifecycle (`Completed` Status):**
   - Once the creator finishes the work, they click **[🎉 Mark Completed & Delivered]** in their dashboard (`PATCH /api/bookings/:id/complete`).
   - This sets booking status to `Completed`, increments the creator's total completed projects counter (`$inc: { completedProjects: 1 }`), and re-opens the gig so new clients can book it again.

---

## Decision Point 3 (DP3) — Intelligent Discovery & SkillMatch Engine

### Question
*"How does the platform rank and match services for clients intelligently without relying on generic AI chatbots?"*

### Product Implementation & Rationale
SkillSwap features a custom **SkillMatch Discovery Engine** implemented in `services/matchingService.js`.

### Ranking & Scoring Breakdown
Gigs are evaluated on a 0–100% **SkillMatch Score** using five key criteria:

1. **Category Exact Fit (25% Weight):** Direct match with user's selected category.
2. **Skill Vector Alignment (25% Weight):** Overlap ratio between requested skills and creator skills.
3. **Search Keyword Relevance (20% Weight):** Text similarity across titles, descriptions, and creator profiles.
4. **Creator Rating & Trust (15% Weight):** Bonus scoring for creators with ratings $\ge 4.8 / 5.0$.
5. **Price Appropriateness (15% Weight):** Alignment with target budget thresholds.

### Transparent Match Highlights & Social Proof Badges
Each gig card and details page explicitly displays:
- SkillMatch breakdown (e.g., `✓ Development category match`, `✓ 3 matching skills`, `⭐ Top rated creator`).
- **🏆 Total Completed Projects Badge** (e.g., `🏆 14 Projects Completed`), providing social proof of creator reliability.

---

## Post-Completion Client Rating & Review Lifecycle

### Product Implementation & Rationale
To complete the service marketplace ecosystem, clients can rate creators after project delivery:

1. **Rating Form Activation:** When a booking is marked `Completed` by the creator, the client's view on `bookings.html` unlocks an interactive **5-Star Rating & Review Form**.
2. **Star Selection & Feedback:** Clients select 1–5 stars and optionally write feedback about their experience.
3. **Backend Recalculation (`PATCH /api/bookings/:id/rate`):**
   - Stores `rating` and `review` on the booking.
   - Dynamically updates the creator's aggregate service rating (`gig.rating`) and total review count (`gig.reviewsCount`).
4. **Submitted State Display:** The booking card updates to show: `⭐ 5/5 Rating Submitted - "Great work!"`.
