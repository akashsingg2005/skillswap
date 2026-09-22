/**
 * Gig Details & Booking Logic
 */

let currentGig = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gigId = urlParams.get('id');

  if (gigId) {
    loadGigDetails(gigId);
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    const emailInput = document.getElementById('client-email');
    if (emailInput) {
      // Keep empty by default so user is not forced to erase pre-filled email
      emailInput.value = '';
    }

    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
});

async function loadGigDetails(gigId) {
  const container = document.getElementById('gig-details-container');
  if (!container) return;

  try {
    const [gigRes, bookingsRes] = await Promise.all([
      api.getGigById(gigId),
      api.getBookings({ gigId }),
    ]);

    if (!gigRes.success || !gigRes.data) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Gig Not Found</h3>
          <a href="index.html" class="btn btn-primary">Return to Marketplace</a>
        </div>
      `;
      return;
    }

    currentGig = gigRes.data;
    const existingBookings = bookingsRes.data || [];
    const isAlreadyBooked = existingBookings.some((b) => b.status === 'Accepted');

    renderGigDetails(currentGig, isAlreadyBooked);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('book') === 'true' && !isAlreadyBooked) {
      openBookingModal();
    }
  } catch (err) {
    console.error('Error loading gig details:', err);
  }
}

async function renderGigDetails(gig, isAlreadyBooked = false) {
  const container = document.getElementById('gig-details-container');
  if (!container) return;

  const skillsList = (gig.skills || [])
    .map((s) => `<span class="skill-tag" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">${s}</span>`)
    .join('');

  const highlightsList = (gig.matchHighlights || [])
    .map((h) => `<li style="margin-bottom: 0.4rem; color: #34d399; font-weight: 600;">${h}</li>`)
    .join('');

  const initial = (gig.creatorName || 'C').charAt(0).toUpperCase();

  const bookedAlertHtml = isAlreadyBooked
    ? `
      <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm);">
        <div style="font-weight: 800; color: #991b1b; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
          🔒 Creator Currently Unavailable
        </div>
        <div style="color: #7f1d1d; font-size: 0.95rem;">
          This service gig has already accepted a booking and is currently booked by another client. Check out similar creators below!
        </div>
      </div>
    `
    : '';

  const bookingButtonHtml = isAlreadyBooked
    ? `
      <button class="btn" style="width: 100%; padding: 0.85rem; font-size: 0.95rem; background: #e2e8f0; color: #64748b; cursor: not-allowed;" disabled>
        🔒 Gig Already Booked
      </button>
    `
    : `
      <button class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 1.05rem;" onclick="openBookingModal()">
        Book Now
      </button>
    `;

  container.innerHTML = `
    ${bookedAlertHtml}
    <div class="gig-details-layout">
      <div class="gig-details-main">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
          <span class="gig-category">${gig.category}</span>
          <span class="gig-rating">⭐ ${gig.rating || 4.8} (${gig.reviewsCount || 12} reviews)</span>
        </div>

        <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.2;">${gig.title}</h1>

        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; background: var(--bg-card); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); width: fit-content; flex-wrap: wrap;">
          <span class="creator-avatar" style="width: 36px; height: 36px; font-size: 1rem;">${initial}</span>
          <div>
            <div style="font-weight: 700; font-size: 1rem;">${gig.creatorName}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Verified Creator</div>
          </div>
          <div class="completed-projects-badge" style="margin-left: 0.5rem; margin-bottom: 0;">
            🏆 <strong>${gig.completedProjects || gig.reviewsCount || 12}</strong> Projects Completed
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Description</h3>
          <p style="color: var(--text-secondary); font-size: 1.05rem; white-space: pre-line; line-height: 1.7;">${gig.description}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Skills & Technologies</h3>
          <div class="skills-tags">${skillsList}</div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-lg); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #34d399; display: flex; align-items: center; gap: 0.5rem;">
              ⚡ SkillMatch Discovery Breakdown
            </h3>
            <span style="font-size: 1.25rem; font-weight: 800; color: #34d399;">${gig.skillMatch || 88}%</span>
          </div>
          <ul style="list-style: none; padding: 0; font-size: 0.95rem;">
            ${highlightsList}
          </ul>
        </div>
      </div>

      <div class="gig-details-sidebar">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem;">Service Rate</div>
        <div style="font-size: 2.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1.25rem;">
          ${formatCurrency(gig.rate)}
        </div>

        <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
          <li>✓ Instant booking submission</li>
          <li>✓ Razorpay Test Mode checkout</li>
          <li>✓ No account required</li>
        </ul>

        ${bookingButtonHtml}
      </div>
    </div>

    <!-- Similar Gigs Section -->
    <div id="similar-gigs-section" style="margin-top: 3.5rem; border-top: 1px solid var(--border-color); padding-top: 2.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">⚡ Similar Creators & Services</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">Explore available creators with matching skills in ${gig.category}</p>
        </div>
      </div>
      <div id="similar-gigs-container" class="gigs-grid">
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem 0;">Loading similar creators...</div>
      </div>
    </div>
  `;

  loadSimilarGigs(gig);
}

async function loadSimilarGigs(currentGig) {
  const container = document.getElementById('similar-gigs-container');
  if (!container) return;

  try {
    const res = await api.getGigs({ category: currentGig.category });
    if (!res.success || !res.data) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted);">No similar gigs found.</div>`;
      return;
    }

    const similarGigs = res.data.filter((g) => g._id.toString() !== currentGig._id.toString());
    if (similarGigs.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted);">No alternative creators currently listed in ${currentGig.category}.</div>`;
      return;
    }

    container.innerHTML = similarGigs.slice(0, 3).map((gig) => renderGigCard(gig)).join('');
  } catch (err) {
    console.error('Error loading similar gigs:', err);
    container.innerHTML = '';
  }
}

function openBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    const emailInput = document.getElementById('client-email');
    if (emailInput) {
      emailInput.value = ''; // Ensure clean blank field for user
    }
    modal.classList.add('active');
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('active');
}

async function handleBookingSubmit(e) {
  e.preventDefault();

  if (!currentGig) {
    showToast('Gig details not loaded', 'danger');
    return;
  }

  const submitBtn = document.getElementById('submit-booking-btn');
  const name = document.getElementById('client-name').value;
  const email = document.getElementById('client-email').value;
  const requirements = document.getElementById('requirements').value;
  const preferredDate = document.getElementById('preferred-date').value;

  if (!name || !email || !requirements || !preferredDate) {
    showToast('Please fill in all booking fields', 'warning');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Creating Booking...';

    setStoredClientEmail(email);

    const bookingRes = await api.createBooking({
      gigId: currentGig._id,
      clientName: name,
      clientEmail: email,
      requirements: requirements,
      preferredDate: preferredDate,
    });

    if (!bookingRes.success) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Continue to Payment';

      // Check if gig is already booked (409 Conflict)
      if (bookingRes.message && bookingRes.message.includes('already accepted')) {
        closeBookingModal();
        showToast('⚠️ This creator gig was just booked! Check out similar creators below.', 'warning');
        renderGigDetails(currentGig, true);
        const section = document.getElementById('similar-gigs-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      showToast(bookingRes.message || 'Failed to create booking', 'danger');
      return;
    }

    const booking = bookingRes.data;
    showToast('✓ Booking created successfully! Proceeding to payment...', 'success');
    closeBookingModal();

    initiatePayment(booking._id, currentGig.rate, name, email, (updatedBooking) => {
      window.location.href = `bookings.html?email=${encodeURIComponent(email)}`;
    });
  } catch (err) {
    console.error('Booking submission error:', err);
    showToast('An error occurred during booking', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Continue to Payment';
    }
  }
}
