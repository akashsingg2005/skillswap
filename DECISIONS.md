# SkillSwap Decision Points

**Hackathon ID:** AZIS-DGFPCR  
**Track:** Track 2 – Web Product  
**Project:** SkillSwap — Creator Gig Marketplace

---

## Decision Point 1 (DP1) — Rejection & "Find Similar Creators"

### Question
*"What can a client see and do after a creator declines a booking request?"*

### Product Implementation & Rationale
When a creator declines a booking request on the Creator Dashboard:

1. **Status Update:** The booking status instantly changes to `Declined` on the backend, with an optional decline reason stored (e.g., *"Creator is unavailable on requested date"*).
2. **Client Visibility:** On the client's **My Bookings** page (`bookings.html`), the booking card renders a distinct red alert banner displaying:
   - Status badge: `✕ Declined`
   - Explicit decline reason from creator.
3. **No Dead-End Experience:** Instead of leaving the user stranded, a prominent **[Find Similar Creators]** button is presented.
4. **Intelligent Redirect:** Clicking **[Find Similar Creators]** redirects the client back to the marketplace (`index.html`), automatically applying URL query parameters (`?category=...&search=...`) that filter recommended gigs matching the category, price tier, and skills of the declined service.

---

## Decision Point 2 (DP2) — Double Booking Guard

### Question
*"Can a gig accept a new booking while another booking request is still Pending?"*

### Product Implementation & Rationale
Multiple clients are permitted to submit booking requests for the same gig, creating multiple `Pending` requests:

$$\text{Booking A (Pending)} \quad | \quad \text{Booking B (Pending)} \quad | \quad \text{Booking C (Pending)}$$

When the creator accepts **Booking B**:

1. **Atomic Backend Guard:** The `PATCH /api/bookings/:id/accept` endpoint first checks if another booking for the same `gigId` is ALREADY set to `Accepted`.
2. **Conflict Prevention (HTTP 409):** If another booking has already been accepted, the API aborts and returns `HTTP 409 Conflict` with a clear message: `"This gig has already accepted another booking request."`
3. **Single Acceptance & Sweep:** If no existing accepted booking exists:
   - **Booking B** $\rightarrow$ `Accepted`
   - **Booking A** $\rightarrow$ `Declined` (Reason: *"Gig unavailable - another request was accepted"*)
   - **Booking C** $\rightarrow$ `Declined` (Reason: *"Gig unavailable - another request was accepted"*)
4. **Backend Enforcement:** This logic is strictly enforced in `controllers/bookingController.js` and does not rely solely on frontend JavaScript validation.

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

### Transparent Match Highlights
Each gig card and details page explicitly displays why a gig was recommended, e.g.:
- `✓ Development category match`
- `✓ 3 matching skills (HTML, CSS, Node.js)`
- `⭐ Top rated creator (4.9/5.0)`
- `✓ Competitive pricing (₹2,500)`

### Fallback Guarantee
The SkillMatch engine operates 100% deterministically on the Node.js backend using pure JavaScript algorithms. If external AI API keys are missing, the system functions flawlessly without degradation.
