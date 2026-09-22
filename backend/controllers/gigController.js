const Gig = require('../models/Gig');
const { calculateSkillMatch } = require('../services/matchingService');
const { sampleGigs } = require('../seed/seedData');

// In-memory fallback dataset for when MongoDB is disconnected
let memoryGigs = sampleGigs.map((gig, idx) => ({
  _id: `mem_gig_${idx + 1}`,
  ...gig,
  createdAt: new Date(),
}));

exports.getGigs = async (req, res) => {
  try {
    const { search, category, sort, skills, maxPrice } = req.query;
    let query = {};

    if (category && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { creatorName: searchRegex },
        { skills: searchRegex },
      ];
    }

    let gigs = [];
    try {
      gigs = await Gig.find(query).sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      // Fallback to in-memory filter if DB is offline
      console.warn('Using in-memory fallback gigs list (DB offline)');
      gigs = memoryGigs.filter((g) => {
        let matchCat = true;
        let matchSearch = true;
        if (category && category.toLowerCase() !== 'all') {
          matchCat = (g.category || '').toLowerCase() === category.trim().toLowerCase();
        }
        if (search && search.trim() !== '') {
          const s = search.trim().toLowerCase();
          matchSearch =
            (g.title || '').toLowerCase().includes(s) ||
            (g.description || '').toLowerCase().includes(s) ||
            (g.creatorName || '').toLowerCase().includes(s) ||
            (g.skills || []).some((sk) => sk.toLowerCase().includes(s));
        }
        return matchCat && matchSearch;
      });
    }

    gigs = gigs.map((gig) => {
      const matchResult = calculateSkillMatch(gig, { search, category, skills, maxPrice });
      return {
        ...gig,
        skillMatch: matchResult.matchScore,
        matchHighlights: matchResult.highlights,
      };
    });

    if (sort === 'recommended') {
      gigs.sort((a, b) => b.skillMatch - a.skillMatch);
    } else if (sort === 'price-low') {
      gigs.sort((a, b) => a.rate - b.rate);
    } else if (sort === 'price-high') {
      gigs.sort((a, b) => b.rate - a.rate);
    } else if (sort === 'rating') {
      gigs.sort((a, b) => b.rating - a.rating);
    } else {
      gigs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      count: gigs.length,
      data: gigs,
    });
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching gigs',
      error: error.message,
    });
  }
};

exports.getGigById = async (req, res) => {
  try {
    let gig = null;
    try {
      gig = await Gig.findById(req.params.id).lean();
    } catch (dbErr) {
      gig = memoryGigs.find((g) => g._id.toString() === req.params.id);
    }

    if (!gig) {
      gig = memoryGigs.find((g) => g._id.toString() === req.params.id);
    }

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    const matchResult = calculateSkillMatch(gig);

    return res.status(200).json({
      success: true,
      data: {
        ...gig,
        skillMatch: matchResult.matchScore,
        matchHighlights: matchResult.highlights,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Invalid Gig ID or Server Error',
      error: error.message,
    });
  }
};

exports.createGig = async (req, res) => {
  try {
    const { title, category, rate, description, skills, creatorName } = req.body;

    if (!title || !category || !rate || !description || !creatorName) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }

    let newGig;
    try {
      newGig = await Gig.create({
        title: title.trim(),
        category: category.trim(),
        rate: Number(rate),
        description: description.trim(),
        skills: skillsArray,
        creatorName: creatorName.trim(),
        rating: 4.9,
        reviewsCount: 1,
      });
    } catch (dbErr) {
      newGig = {
        _id: `mem_gig_${Date.now()}`,
        title: title.trim(),
        category: category.trim(),
        rate: Number(rate),
        description: description.trim(),
        skills: skillsArray,
        creatorName: creatorName.trim(),
        rating: 4.9,
        reviewsCount: 1,
        createdAt: new Date(),
      };
      memoryGigs.unshift(newGig);
    }

    return res.status(201).json({
      success: true,
      message: 'Gig published successfully!',
      data: newGig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating gig',
      error: error.message,
    });
  }
};
