/**
 * SkillSwap Marketplace Engine (gigs.js)
 */

let currentCategory = 'All';
let currentSearch = '';
let currentSort = 'recommended';
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('search-input')) {
    initMarketplace();
  }
});

function initMarketplace() {
  const searchInput = document.getElementById('search-input');
  const categoryPills = document.querySelectorAll('.category-pill');
  const sortSelect = document.getElementById('sort-select');

  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const searchParam = urlParams.get('search');

  if (categoryParam) {
    currentCategory = categoryParam;
    categoryPills.forEach((pill) => {
      if (pill.dataset.category.toLowerCase() === categoryParam.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  if (searchParam) {
    currentSearch = searchParam;
    if (searchInput) searchInput.value = searchParam;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        loadGigs();
      }, 300);
    });
  }

  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'All';
      loadGigs();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadGigs();
    });
  }

  loadGigs();
}

async function loadGigs() {
  const container = document.getElementById('gigs-container');
  const countEl = document.getElementById('results-count');

  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚡ Computing SkillMatch scores...</div>
    </div>
  `;

  try {
    const res = await api.getGigs({
      search: currentSearch,
      category: currentCategory,
      sort: currentSort,
    });

    if (!res.success || !res.data || res.data.length === 0) {
      if (countEl) countEl.innerText = '0 Gigs Found';
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No gigs found matching your criteria</h3>
          <p class="empty-desc">Try clearing your search query or selecting a different category filter.</p>
          <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    if (countEl) countEl.innerText = `${res.data.length} Available Gig${res.data.length > 1 ? 's' : ''}`;

    container.innerHTML = res.data.map((gig) => renderGigCard(gig)).join('');
  } catch (err) {
    console.error('Error loading gigs:', err);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Failed to load marketplace gigs</h3>
        <p class="empty-desc">Please ensure the backend server is running and accessible.</p>
      </div>
    `;
  }
}

function renderGigCard(gig) {
  const skillsList = (gig.skills || [])
    .slice(0, 4)
    .map((s) => `<span class="skill-tag">${s}</span>`)
    .join('');

  const highlightsList = (gig.matchHighlights || [])
    .slice(0, 2)
    .map((h) => `<li>${h}</li>`)
    .join('');

  const initial = (gig.creatorName || 'C').charAt(0).toUpperCase();

  return `
    <div class="gig-card" onclick="navigateToGigDetails('${gig._id}', event)">
      <div>
        <div class="gig-header">
          <span class="gig-category">${gig.category}</span>
          <span class="gig-rating">⭐ ${gig.rating || 4.8} (${gig.reviewsCount || 12})</span>
        </div>

        <h3 class="gig-title">${gig.title}</h3>
        
        <div class="gig-creator">
          <span class="creator-avatar">${initial}</span>
          <span>${gig.creatorName}</span>
        </div>

        <div class="completed-projects-badge">
          🏆 <strong>${gig.completedProjects || gig.reviewsCount || 12}</strong> Projects Completed
        </div>

        <div class="skillmatch-badge">
          ⚡ SkillMatch ${gig.skillMatch || 85}%
        </div>

        <ul class="match-highlights">
          ${highlightsList}
        </ul>

        <div class="skills-tags">
          ${skillsList}
        </div>
      </div>

      <div class="gig-footer">
        <div class="gig-price">
          ${formatCurrency(gig.rate)}
          <span>/ gig</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <a href="gig-details.html?id=${gig._id}" class="btn btn-secondary btn-sm" onclick="event.stopPropagation()">Details</a>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openBookingModalDirect('${gig._id}', '${escapeHtml(gig.title)}', ${gig.rate})">
            Book Now
          </button>
        </div>
      </div>
    </div>
  `;
}

function navigateToGigDetails(gigId, event) {
  if (event && (event.target.closest('button') || event.target.closest('a'))) {
    return;
  }
  window.location.href = `gig-details.html?id=${gigId}`;
}

function resetFilters() {
  currentCategory = 'All';
  currentSearch = '';
  currentSort = 'recommended';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.category-pill').forEach((p) => {
    if (p.dataset.category === 'All') p.classList.add('active');
    else p.classList.remove('active');
  });
  loadGigs();
}

function escapeHtml(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function openBookingModalDirect(gigId, gigTitle, rate) {
  window.location.href = `gig-details.html?id=${gigId}&book=true`;
}
