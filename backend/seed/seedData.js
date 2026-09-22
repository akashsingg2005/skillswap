const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gig = require('../models/Gig');

dotenv.config();

const sampleGigs = [
  {
    title: 'Full Stack Website Development',
    category: 'Development',
    rate: 2500,
    description: 'I will build a clean, responsive full-stack website or web app for your business or project using modern web standards.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB'],
    creatorName: 'Akash',
    rating: 4.9,
    reviewsCount: 24,
  },
  {
    title: 'Modern Logo Design & Brand Identity',
    category: 'Design',
    rate: 1800,
    description: 'High-end vector logo design, color palettes, and typography guidance to establish a strong brand identity.',
    skills: ['Figma', 'Logo Design', 'Branding', 'Vector Graphics', 'Illustrator'],
    creatorName: 'Sanya',
    rating: 4.8,
    reviewsCount: 18,
  },
  {
    title: 'Short-Form Video Editing (Reels & Shorts)',
    category: 'Video Editing',
    rate: 2200,
    description: 'Engaging, fast-paced video edits with captions, sound effects, and transitions optimized for viral reach.',
    skills: ['Premiere Pro', 'After Effects', 'Reels', 'CapCut', 'Sound Design'],
    creatorName: 'Rehan',
    rating: 4.9,
    reviewsCount: 31,
  },
  {
    title: 'Instagram Content Strategy & Growth',
    category: 'Marketing',
    rate: 3000,
    description: 'Data-driven content strategy, hashtag research, and visual grid planning to boost your organic engagement.',
    skills: ['Content Strategy', 'Analytics', 'Social Media', 'Copywriting', 'Growth Marketing'],
    creatorName: 'Ananya',
    rating: 4.7,
    reviewsCount: 15,
  },
  {
    title: 'Developer Portfolio & Resume Website',
    category: 'Development',
    rate: 1500,
    description: 'Custom interactive portfolio website for software engineers and creators to showcase projects and get hired.',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'GitHub Pages', 'Responsive Design'],
    creatorName: 'Vikram',
    rating: 4.8,
    reviewsCount: 12,
  },
  {
    title: 'UI/UX Design for Mobile & Web Apps',
    category: 'UI/UX',
    rate: 3500,
    description: 'User research, interactive wireframes, high-fidelity UI components, and Figma design systems.',
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design System'],
    creatorName: 'Rohan',
    rating: 4.9,
    reviewsCount: 29,
  },
  {
    title: 'Technical Blog & SEO Copywriting',
    category: 'Writing',
    rate: 1200,
    description: 'In-depth, engaging technical articles, documentation, and SEO-optimized blog posts for tech startups.',
    skills: ['Technical Writing', 'SEO', 'Copywriting', 'Documentation', 'Blogging'],
    creatorName: 'Devika',
    rating: 4.7,
    reviewsCount: 19,
  },
  {
    title: 'E-commerce Product Photography & Editing',
    category: 'Photography',
    rate: 4000,
    description: 'Professional high-resolution product photos, studio lighting, background removal, and retouching.',
    skills: ['Studio Photography', 'Lightroom', 'Photoshop', 'Product Retouching', 'Lighting'],
    creatorName: 'Karan',
    rating: 4.8,
    reviewsCount: 14,
  },
  {
    title: 'React Dashboard & Analytics Interface',
    category: 'Development',
    rate: 4500,
    description: 'Custom React dashboard with interactive data tables, live metrics, chart visualizer, and backend API hookups.',
    skills: ['React', 'Chart.js', 'REST APIs', 'Node.js', 'Dashboard UI'],
    creatorName: 'Meera',
    rating: 5.0,
    reviewsCount: 22,
  },
  {
    title: 'High-CTR YouTube Thumbnail & Graphic Kit',
    category: 'Design',
    rate: 999,
    description: 'Attention-grabbing custom YouTube thumbnails designed to maximize click-through rate and viewer retention.',
    skills: ['Photoshop', 'Thumbnail Design', 'CTR Optimization', 'Graphic Design', 'Visual Effects'],
    creatorName: 'Aarav',
    rating: 4.9,
    reviewsCount: 42,
  },
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';
    await mongoose.connect(connStr);
    console.log('MongoDB connected for seeding...');

    await Gig.deleteMany({});
    const createdGigs = await Gig.insertMany(sampleGigs);
    console.log(`Successfully seeded ${createdGigs.length} sample gigs!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { sampleGigs, seedDB };
