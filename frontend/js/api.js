/**
 * SkillSwap Central REST API Client
 * Configured for separate frontend & backend deployments.
 */

// Dynamic Backend Base URL
const getApiBaseUrl = () => {
  if (window.ENV_API_BASE_URL) {
    return window.ENV_API_BASE_URL.replace(/\/$/, '');
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Support Cloudflare Pages fallback to Render API
  if (window.RENDER_BACKEND_URL) {
    return `${window.RENDER_BACKEND_URL.replace(/\/$/, '')}/api`;
  }
  return window.location.origin + '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = {
  // Gigs APIs
  getGigs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/gigs${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  getGigById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/gigs/${id}`);
    return res.json();
  },

  createGig: async (gigData) => {
    const res = await fetch(`${API_BASE_URL}/gigs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gigData),
    });
    return res.json();
  },

  // Bookings APIs
  createBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/bookings${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  getBookingById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`);
    return res.json();
  },

  acceptBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/accept`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  declineBooking: async (id, reason = '') => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/decline`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  completeBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  rateBooking: async (id, rating, review = '') => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/rate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
    return res.json();
  },

  // Payment APIs
  createPaymentOrder: async (bookingId, amount) => {
    const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount }),
    });
    return res.json();
  },

  verifyPayment: async (paymentDetails) => {
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    });
    return res.json();
  },

  // SkillMatch Engine API
  getMatches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/match?${query}`);
    return res.json();
  },
};
