/**
 * SkillMatch Discovery Engine (DP3)
 */

function calculateSkillMatch(gig, queryParams = {}) {
  const { search = '', category = '', skills = [], maxPrice = 0 } = queryParams;
  
  let score = 50;
  const reasons = [];

  const searchLower = search.trim().toLowerCase();
  const gigTitleLower = (gig.title || '').toLowerCase();
  const gigDescLower = (gig.description || '').toLowerCase();
  const gigCreatorLower = (gig.creatorName || '').toLowerCase();
  const gigCategory = gig.category || '';
  const gigSkills = (gig.skills || []).map(s => s.toLowerCase());

  // 1. Category Match (Max 25 pts)
  if (category && category.toLowerCase() !== 'all') {
    if (gigCategory.toLowerCase() === category.toLowerCase()) {
      score += 25;
      reasons.push(`✓ ${gigCategory} category match`);
    } else {
      score -= 10;
    }
  } else {
    score += 10;
  }

  // 2. Search Relevance (Max 20 pts)
  if (searchLower) {
    let searchHit = false;
    if (gigTitleLower.includes(searchLower)) {
      score += 15;
      searchHit = true;
    }
    if (gigDescLower.includes(searchLower)) {
      score += 10;
      searchHit = true;
    }
    if (gigCreatorLower.includes(searchLower)) {
      score += 10;
      searchHit = true;
    }
    if (gigSkills.some(s => s.includes(searchLower))) {
      score += 15;
      searchHit = true;
    }
    if (searchHit) {
      reasons.push(`✓ Matches keyword "${search}"`);
    }
  }

  // 3. Skill Match Alignment (Max 25 pts)
  let userSkills = [];
  if (Array.isArray(skills)) {
    userSkills = skills;
  } else if (typeof skills === 'string' && skills.trim()) {
    userSkills = skills.split(',').map(s => s.trim());
  }

  if (userSkills.length > 0) {
    const matchedSkills = [];
    userSkills.forEach(skill => {
      const sLower = skill.toLowerCase();
      if (gigSkills.some(gs => gs.includes(sLower) || sLower.includes(gs))) {
        matchedSkills.push(skill);
      }
    });

    if (matchedSkills.length > 0) {
      const matchRatio = matchedSkills.length / userSkills.length;
      const skillPts = Math.min(25, Math.round(matchRatio * 25));
      score += skillPts;
      reasons.push(`✓ ${matchedSkills.length} matching skill${matchedSkills.length > 1 ? 's' : ''} (${matchedSkills.slice(0, 3).join(', ')})`);
    }
  } else {
    if (gigSkills.length >= 3) {
      reasons.push(`✓ Broad skill set (${gig.skills.slice(0, 3).join(', ')})`);
    }
  }

  // 4. Rating Bonus (Max 15 pts)
  const rating = Number(gig.rating) || 4.5;
  if (rating >= 4.8) {
    score += 15;
    reasons.push(`⭐ Top rated creator (${rating}/5.0)`);
  } else if (rating >= 4.5) {
    score += 10;
    reasons.push(`⭐ High rating (${rating}/5.0)`);
  } else {
    score += 5;
  }

  // 5. Price Suitability (Max 15 pts)
  const price = Number(gig.rate) || 0;
  if (maxPrice > 0) {
    if (price <= maxPrice) {
      score += 15;
      reasons.push(`✓ Within target budget (₹${price.toLocaleString('en-IN')})`);
    } else {
      score -= 10;
    }
  } else {
    if (price <= 3000) {
      reasons.push(`✓ Competitive pricing (₹${price.toLocaleString('en-IN')})`);
    }
  }

  const finalMatchScore = Math.min(99, Math.max(62, Math.round(score)));

  return {
    matchScore: finalMatchScore,
    highlights: reasons.length > 0 ? reasons : ['✓ Verified creator service', '✓ Instant booking available']
  };
}

module.exports = {
  calculateSkillMatch,
};
