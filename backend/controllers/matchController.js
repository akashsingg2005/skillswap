const Gig = require('../models/Gig');
const { calculateSkillMatch } = require('../services/matchingService');

exports.getMatches = async (req, res) => {
  try {
    const { search = '', category = '', skills = '', maxPrice = 0 } = req.query;

    const allGigs = await Gig.find().lean();

    const matchedGigs = allGigs.map((gig) => {
      const matchResult = calculateSkillMatch(gig, {
        search,
        category,
        skills,
        maxPrice: Number(maxPrice) || 0,
      });

      return {
        ...gig,
        skillMatch: matchResult.matchScore,
        matchHighlights: matchResult.highlights,
      };
    });

    matchedGigs.sort((a, b) => b.skillMatch - a.skillMatch);

    return res.status(200).json({
      success: true,
      count: matchedGigs.length,
      data: matchedGigs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error computing matches',
      error: error.message,
    });
  }
};
