const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const assets = [
  { path: 'public/luxury5.jpg.jpeg', type: 'image', id: 'luxury5' },
  { path: 'public/luxury6.jpg.jpeg', type: 'image', id: 'luxury6' },
  { path: 'public/luxury7.jpeg', type: 'image', id: 'luxury7' },
  { path: 'public/hero_video_2.mp4', type: 'video', id: 'hero_video_2' },
  { path: 'public/banner/hero_video.mp4', type: 'video', id: 'hero_video' }
];

async function uploadAssets() {
  console.log('Starting Cloudinary upload...');
  const results = {};
  
  for (const asset of assets) {
    const fullPath = path.join(__dirname, '..', asset.path);
    try {
      console.log(`Uploading ${asset.path}...`);
      const result = await cloudinary.uploader.upload(fullPath, {
        resource_type: asset.type,
        folder: 'hero_banners',
        public_id: asset.id
      });
      console.log(`Uploaded ${asset.path}: ${result.secure_url}`);
      results[asset.id] = result.secure_url;
    } catch (error) {
      console.error(`Error uploading ${asset.path}:`, error.message);
    }
  }
  
  console.log('--- UPLOAD SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
}

uploadAssets();
