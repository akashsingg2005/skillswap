/**
 * Creator Dashboard & My Bookings Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('dashboard.html')) {
    initCreatorDashboard();
  } else if (path.includes('bookings.html')) {
    initMyBookings();
  }
});

async function initCreatorDashboard() {
  const container = document.getElementById('dashboard-bookings-container');
  if (!container) return;

  try {
    const [bookingsRes, gigsRes] = await Promise.all([
      api.getBookings(),
      api.getGigs(),
    ]);

    const bookings = bookingsRes.data || [];
    const gigs = gigsRes.data || [];

    const totalGigs = gigs.length;
    const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
    const acceptedCount = bookings.filter((b) => b.status === 'Accepted').length;
    const completedCount = bookings.filter((b) => b.status === 'Completed').length;
    const declinedCount = bookings.filter((b) => b.status === 'Declined').length;

    const totalEarnings = bookings
      .filter((b) => b.status === 'Accepted' || b.status === 'Completed' || b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + (b.gigId ? b.gigId.rate || 0 : 0), 0);

    updateStatEl('stat-total-gigs', totalGigs);
    updateStatEl('stat-pending', pendingCount);
    updateStatEl('stat-accepted', acceptedCount);
    updateStatEl('stat-completed', completedCount);
    updateStatEl('stat-declined', declinedCount);
    updateStatEl('stat-earnings', formatCurrency(totalEarnings));

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📥</div>
          <h3 class="empty-title">No incoming booking requests yet</h3>
          <p class="empty-desc">When clients book your services, their requests will appear here for your review.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map((b) => renderCreatorBookingCard(b)).join('');
  } catch (err) {
    console.error('Error loading creator dashboard:', err);
  }
}

function renderCreatorBookingCard(b) {
  const gig = b.gigId || {};
  const statusBadge = getStatusBadge(b.status);
  const paymentBadge = getPaymentBadge(b.paymentStatus);
  const isPending = b.status === 'Pending';

  return `
    <div class="booking-card" id="booking-card-${b._id}">
      <div class="booking-top">
        <div>
          <h3 class="booking-gig-title">${gig.title || 'Service Gig'}</h3>
          <div class="booking-client-info">
            Client: <strong>${b.clientName}</strong> (${b.clientEmail}) • Requested Date: <strong>${formatDate(b.preferredDate)}</strong>
          </div>
        </div>
        <div class="status-badges">
          ${statusBadge}
          ${paymentBadge}
        </div>
      </div>

      <div class="requirements-box">
        <div class="requirements-title">Client Requirements & Notes</div>
        <div>${b.requirements}</div>
      </div>

      ${
        b.declineReason
          ? `<div style="font-size: 0.85rem; color: var(--danger);">Reason: ${b.declineReason}</div>`
          : ''
      }

      <div class="booking-actions">
        <div style="font-size: 1.1rem; font-weight: 800;">
          Rate: ${formatCurrency(gig.rate)}
        </div>
        <div style="display: flex; gap: 0.75rem;">
          ${
            isPending
              ? `
            <button class="btn btn-accept btn-sm" onclick="handleAcceptBooking('${b._id}')">
              ✓ Accept Request
            </button>
            <button class="btn btn-decline btn-sm" onclick="handleDeclineBookingPrompt('${b._id}')">
              ✕ Decline Request
            </button>
          `
              : b.status === 'Accepted'
              ? `
            <button class="btn btn-primary btn-sm" style="background: #0284c7; border-color: #0284c7;" onclick="handleCompleteBooking('${b._id}')">
              🎉 Mark Completed & Delivered
            </button>
          `
              : `<span style="font-size: 0.85rem; color: var(--text-muted);">Status: ${b.status}</span>`
          }
        </div>
      </div>
    </div>
  `;
}

async function handleAcceptBooking(bookingId) {
  try {
    const res = await api.acceptBooking(bookingId);

    if (res.success) {
      showToast('✓ Booking accepted! DP2 double-booking protection active.', 'success');
      initCreatorDashboard();
    } else {
      showToast(res.message || 'Error accepting booking', 'danger');
    }
  } catch (err) {
    showToast('Error accepting booking', 'danger');
  }
}

async function handleCompleteBooking(bookingId) {
  try {
    const res = await api.completeBooking(bookingId);

    if (res.success) {
      showToast('🎉 Booking marked as Completed & Delivered! Service is now open for new bookings.', 'success');
      initCreatorDashboard();
    } else {
      showToast(res.message || 'Error completing booking', 'danger');
    }
  } catch (err) {
    showToast('Error completing booking', 'danger');
  }
}

function handleDeclineBookingPrompt(bookingId) {
  const reason = prompt('Enter a reason for declining this request (optional):', 'Creator is unavailable on requested date');
  if (reason === null) return;

  executeDeclineBooking(bookingId, reason);
}

async function executeDeclineBooking(bookingId, reason) {
  try {
    const res = await api.declineBooking(bookingId, reason);

    if (res.success) {
      showToast('Booking request declined.', 'warning');
      initCreatorDashboard();
    } else {
      showToast(res.message || 'Error declining booking', 'danger');
    }
  } catch (err) {
    showToast('Error declining booking', 'danger');
  }
}

async function initMyBookings() {
  const container = document.getElementById('my-bookings-container');
  const emailInput = document.getElementById('search-email-input');
  const searchForm = document.getElementById('bookings-search-form');

  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  // ONLY auto-search if explicitly passed in URL parameter (e.g. ?email=client@example.com)
  let email = urlParams.get('email') || '';

  if (emailInput) {
    emailInput.value = email;
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchVal = emailInput ? emailInput.value.trim() : '';
      if (searchVal) {
        setStoredClientEmail(searchVal);
        loadClientBookings(searchVal);
      } else {
        renderEmptyEmailPrompt();
      }
    });
  }

  if (email) {
    loadClientBookings(email);
  } else {
    renderEmptyEmailPrompt();
  }
}

function renderEmptyEmailPrompt() {
  const container = document.getElementById('my-bookings-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state" style="padding: 3.5rem 1.5rem;">
      <div class="empty-icon">📧</div>
      <h3 class="empty-title">Track Your Service Requests</h3>
      <p class="empty-desc" style="max-width: 480px; margin: 0.5rem auto 1.5rem;">
        Enter your email address in the search box above to view your service requests, creator responses, and payment history.
      </p>
      <a href="index.html" class="btn btn-secondary">Browse Marketplace</a>
    </div>
  `;
}

async function loadClientBookings(email) {
  const container = document.getElementById('my-bookings-container');
  if (!container) return;

  if (!email) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📧</div>
        <h3 class="empty-title">Enter your Client Email</h3>
        <p class="empty-desc">Enter the email address you used when booking a gig to view your bookings.</p>
        <div style="max-width: 380px; margin: 0 auto; display: flex; gap: 0.5rem;">
          <input type="email" id="email-entry" class="form-input" placeholder="e.g. client@example.com">
          <button class="btn btn-primary" onclick="setManualEmail()">Search</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
      Loading your bookings for ${email}...
    </div>
  `;

  try {
    const res = await api.getBookings({ email });

    if (!res.success || !res.data || res.data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">No bookings found for ${email}</h3>
          <p class="empty-desc">Explore the marketplace to book top young creators and get your project built!</p>
          <a href="index.html" class="btn btn-primary">Browse Marketplace</a>
        </div>
      `;
      return;
    }

    container.innerHTML = res.data.map((b) => renderClientBookingCard(b)).join('');
  } catch (err) {
    console.error('Error loading client bookings:', err);
  }
}

function setManualEmail() {
  const input = document.getElementById('email-entry');
  if (input && input.value) {
    setStoredClientEmail(input.value);
    loadClientBookings(input.value.trim());
  }
}

function renderClientBookingCard(b) {
  const gig = b.gigId || {};
  const isDeclined = b.status === 'Declined';
  const isCompleted = b.status === 'Completed';
  const isPendingPayment = b.paymentStatus === 'Pending' && !isDeclined && !isCompleted;

  const statusBadge = getStatusBadge(b.status);
  const paymentBadge = getPaymentBadge(b.paymentStatus);

  return `
    <div class="booking-card">
      <div class="booking-top">
        <div>
          <h3 class="booking-gig-title">${gig.title || 'Service Gig'}</h3>
          <div class="booking-client-info">
            Creator: <strong>${gig.creatorName || 'Creator'}</strong> • Requested Date: <strong>${formatDate(b.preferredDate)}</strong>
          </div>
        </div>
        <div class="status-badges">
          ${statusBadge}
          ${paymentBadge}
        </div>
      </div>

      <div class="requirements-box">
        <div class="requirements-title">Your Submitted Requirements</div>
        <div>${b.requirements}</div>
      </div>

      ${
        isCompleted
          ? b.rating
            ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 1.1rem; margin-top: 0.75rem;">
          <div style="color: #166534; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between;">
            <span>🎉 Project Completed & Delivered!</span>
            <span style="background: #fef3c7; color: #b45309; padding: 0.25rem 0.65rem; border-radius: 20px; font-weight: 800; font-size: 0.85rem; border: 1px solid #fde68a;">
              ⭐ ${b.rating}/5 Rating Submitted
            </span>
          </div>
          <div style="color: #15803d; font-size: 0.85rem; margin-top: 0.25rem;">
            The creator has successfully completed and delivered your project requirements.
          </div>
          ${
            b.review
              ? `<div style="margin-top: 0.6rem; font-size: 0.85rem; color: #334155; background: #ffffff; padding: 0.6rem 0.85rem; border-radius: 6px; border: 1px solid #cbd5e1; font-style: italic;">
              "${b.review}"
            </div>`
              : ''
          }
        </div>
      `
            : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 1.1rem; margin-top: 0.75rem;">
          <div style="color: #166534; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 0.35rem;">
            🎉 Project Completed & Delivered!
          </div>
          <div style="color: #15803d; font-size: 0.85rem; margin-top: 0.25rem; margin-bottom: 0.85rem;">
            The creator has completed your project! Please rate your experience and leave feedback.
          </div>

          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">Rate your experience:</div>
            <div class="star-rating-select" id="star-rating-${b._id}" style="display: flex; gap: 0.35rem; font-size: 1.6rem; cursor: pointer; color: #f59e0b;">
              <span onclick="selectStarRating('${b._id}', 1)" data-star="1">★</span>
              <span onclick="selectStarRating('${b._id}', 2)" data-star="2">★</span>
              <span onclick="selectStarRating('${b._id}', 3)" data-star="3">★</span>
              <span onclick="selectStarRating('${b._id}', 4)" data-star="4">★</span>
              <span onclick="selectStarRating('${b._id}', 5)" data-star="5">★</span>
            </div>
            <input type="hidden" id="rating-val-${b._id}" value="5">

            <textarea id="review-text-${b._id}" class="form-input" rows="2" style="font-size: 0.85rem;" placeholder="Write a brief review / feedback for the creator (optional)..."></textarea>
            <button class="btn btn-primary btn-sm" style="width: fit-content;" onclick="submitClientRating('${b._id}', '${b.clientEmail}')">
              ⭐ Submit Rating & Review
            </button>
          </div>
        </div>
      `
          : isDeclined
          ? `
        <div class="decline-alert">
          <div class="decline-title">
            <span>⚠️ BOOKING DECLINED BY CREATOR</span>
          </div>
          <div class="decline-reason">
            Reason: "${b.declineReason || 'The creator is unavailable for your requested date.'}"
          </div>
          <div style="background: #ffffff; border: 1px solid #fca5a5; border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-top: 0.35rem;">
            <div style="font-weight: 800; color: #9f1239; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem;">
              💳 Refund Status: Processed Automatically
            </div>
            <div style="color: #475569; font-size: 0.85rem; margin-top: 0.25rem; line-height: 1.5;">
              Your payment of <strong>${formatCurrency(gig.rate)}</strong> will be automatically refunded back to the same bank account / payment method used during checkout within 3–5 business days.
            </div>
          </div>
          <div style="margin-top: 0.5rem;">
            <a href="index.html?category=${encodeURIComponent(gig.category || '')}&search=${encodeURIComponent(gig.skills ? gig.skills[0] || '' : '')}" class="btn btn-primary btn-sm">
              🔍 Find Similar Creators
            </a>
          </div>
        </div>
      `
          : ''
      }

      <div class="booking-actions">
        <div style="font-size: 1.1rem; font-weight: 800;">
          Price: ${formatCurrency(gig.rate)}
        </div>
        <div>
          ${
            isPendingPayment
              ? `
            <button class="btn btn-primary btn-sm" onclick="initiatePayment('${b._id}', ${gig.rate}, '${b.clientName}', '${b.clientEmail}', () => loadClientBookings('${b.clientEmail}'))">
              💳 Pay ${formatCurrency(gig.rate)} Now
            </button>
          `
              : ''
          }
        </div>
      </div>
    </div>
  `;
}

function selectStarRating(bookingId, starCount) {
  const container = document.getElementById(`star-rating-${bookingId}`);
  const input = document.getElementById(`rating-val-${bookingId}`);
  if (!container || !input) return;

  input.value = starCount;
  const stars = container.querySelectorAll('span');
  stars.forEach((star, idx) => {
    if (idx < starCount) {
      star.style.color = '#f59e0b';
    } else {
      star.style.color = '#cbd5e1';
    }
  });
}

async function submitClientRating(bookingId, clientEmail) {
  const ratingInput = document.getElementById(`rating-val-${bookingId}`);
  const reviewInput = document.getElementById(`review-text-${bookingId}`);

  const rating = ratingInput ? parseInt(ratingInput.value, 10) : 5;
  const review = reviewInput ? reviewInput.value.trim() : '';

  try {
    const res = await api.rateBooking(bookingId, rating, review);
    if (res.success) {
      showToast('⭐ Rating & review submitted successfully!', 'success');
      loadClientBookings(clientEmail);
    } else {
      showToast(res.message || 'Error submitting rating', 'danger');
    }
  } catch (err) {
    showToast('Error submitting rating', 'danger');
  }
}

function getStatusBadge(status) {
  if (status === 'Completed') return `<span class="badge badge-accepted" style="background: #e0f2fe; color: #0369a1; border-color: #7dd3fc;">🎉 Completed</span>`;
  if (status === 'Accepted') return `<span class="badge badge-accepted">✓ Accepted</span>`;
  if (status === 'Declined') return `<span class="badge badge-declined">✕ Declined</span>`;
  return `<span class="badge badge-pending">⏳ Pending</span>`;
}

function getPaymentBadge(status) {
  if (status === 'Paid') return `<span class="badge badge-paid">💳 Paid</span>`;
  return `<span class="badge badge-pending">Payment Pending</span>`;
}

function updateStatEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}
