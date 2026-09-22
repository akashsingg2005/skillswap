const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');

dotenv.config();

const sampleGigs = [
  {
    title: 'Full Stack MERN Web Application Development',
    category: 'Development',
    rate: 3500,
    description: 'I will design and build a modern, high-performance full-stack web application using React, Node.js, Express, and MongoDB with clean architecture and responsive UI.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    creatorName: 'Akash Kumar Singh',
    rating: 4.9,
    reviewsCount: 28,
    completedProjects: 32,
  },
  {
    title: 'Modern UI/UX Figma Design & Product Systems',
    category: 'UI/UX',
    rate: 2800,
    description: 'User research, wireframing, high-fidelity interactive prototypes, and scalable Figma design systems for web apps and mobile interfaces.',
    skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
    creatorName: 'Raj Solanki',
    rating: 4.9,
    reviewsCount: 22,
    completedProjects: 25,
  },
  {
    title: 'Short-Form Viral Video Editing (Reels, Shorts & TikTok)',
    category: 'Video Editing',
    rate: 2200,
    description: 'Fast-paced, engaging video editing with dynamic captions, sound effects, B-rolls, and motion graphics optimized for maximum viewer retention.',
    skills: ['Premiere Pro', 'After Effects', 'Reels', 'CapCut', 'Sound Design', 'Motion Graphics'],
    creatorName: 'Narayan Kumar',
    rating: 4.8,
    reviewsCount: 35,
    completedProjects: 40,
  },
  {
    title: 'Technical Writing, Developer Docs & SEO Blogs',
    category: 'Writing',
    rate: 1800,
    description: 'In-depth, SEO-optimized technical articles, API documentation, developer guides, and tech blog posts engineered to drive organic search traffic.',
    skills: ['Technical Writing', 'SEO', 'API Documentation', 'Copywriting', 'Blogging'],
    creatorName: 'Adarsh Kumar',
    rating: 4.7,
    reviewsCount: 19,
    completedProjects: 21,
  },
  {
    title: 'Cross-Platform Mobile App Development (React Native)',
    category: 'Development',
    rate: 4500,
    description: 'Custom iOS and Android mobile app development with slick animations, offline data sync, native performance, and backend REST API integration.',
    skills: ['React Native', 'Mobile Apps', 'JavaScript', 'Redux', 'iOS/Android', 'REST APIs'],
    creatorName: 'Aryan Kumar Singh',
    rating: 5.0,
    reviewsCount: 16,
    completedProjects: 18,
  },
  {
    title: 'Commercial Product Photography & High-End Retouching',
    category: 'Photography',
    rate: 4000,
    description: 'Studio lighting product shoots, background replacement, color grading, and high-resolution photo editing for Amazon and Shopify stores.',
    skills: ['Product Photography', 'Lightroom', 'Photoshop', 'Studio Lighting', 'Photo Retouching'],
    creatorName: 'Vishal Kumar',
    rating: 4.9,
    reviewsCount: 24,
    completedProjects: 27,
  },
  {
    title: 'Minimalist Vector Logo Design & Brand Identity Package',
    category: 'Design',
    rate: 2000,
    description: 'Iconic vector logos, color palette guidelines, brand books, and business card templates to help your startup stand out from competitors.',
    skills: ['Logo Design', 'Branding', 'Vector Graphics', 'Illustrator', 'Figma'],
    creatorName: 'Sanya Sharma',
    rating: 4.8,
    reviewsCount: 31,
    completedProjects: 36,
  },
  {
    title: 'Instagram & Social Media Growth Marketing Strategy',
    category: 'Marketing',
    rate: 3200,
    description: 'Data-backed content calendar planning, target audience research, hashtag optimization, and organic engagement strategies for creators & SMBs.',
    skills: ['Digital Marketing', 'Social Media', 'Analytics', 'Growth Hacking', 'Content Strategy'],
    creatorName: 'Ananya Verma',
    rating: 4.8,
    reviewsCount: 27,
    completedProjects: 30,
  },
  {
    title: '3D Motion Graphics & Promo Video Animation',
    category: 'Video Editing',
    rate: 3800,
    description: 'Stunning 3D intro animations, logo reveals, product demo explainer videos, and custom visual effects for YouTube and brand advertising.',
    skills: ['After Effects', 'Cinema 4D', '3D Animation', 'Motion Graphics', 'VFX'],
    creatorName: 'Rehan Siddiqui',
    rating: 4.9,
    reviewsCount: 18,
    completedProjects: 20,
  },
  {
    title: 'DevOps, Docker & Cloud Infrastructure Automation',
    category: 'Development',
    rate: 5000,
    description: 'Docker containerization, CI/CD pipeline setup (GitHub Actions), AWS/Render server deployment, and NGINX SSL reverse proxy setup.',
    skills: ['Docker', 'DevOps', 'AWS', 'Linux', 'CI/CD', 'NGINX'],
    creatorName: 'Vikram Malhotra',
    rating: 5.0,
    reviewsCount: 15,
    completedProjects: 19,
  },
  {
    title: 'Interactive Data Analytics Dashboard Interface',
    category: 'Development',
    rate: 4200,
    description: 'Building custom data dashboards with live metric cards, interactive charts, downloadable reports, and responsive desktop layout.',
    skills: ['React', 'Chart.js', 'D3.js', 'Tailwind CSS', 'JavaScript'],
    creatorName: 'Meera Joshi',
    rating: 4.9,
    reviewsCount: 21,
    completedProjects: 23,
  },
  {
    title: 'High-CTR YouTube Thumbnail & Channel Banner Kit',
    category: 'Design',
    rate: 1200,
    description: 'Eye-catching YouTube thumbnails designed to boost click-through rates, thumbnail templates, and channel art branding.',
    skills: ['Photoshop', 'Thumbnails', 'Graphic Design', 'Visual Composition'],
    creatorName: 'Aarav Patel',
    rating: 4.9,
    reviewsCount: 45,
    completedProjects: 52,
  },
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';
    await mongoose.connect(connStr);
    console.log('MongoDB connected for seeding...');

    await Booking.deleteMany({});
    console.log('Cleared all existing test bookings.');

    await Gig.deleteMany({});
    console.log('Cleared all existing test gigs.');

    const createdGigs = await Gig.insertMany(sampleGigs);
    console.log(`Successfully seeded ${createdGigs.length} high-profile creator gigs!`);

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
