/**
 * Image Upload Utilities — ImgBB integration and multer config
 */
const multer = require('multer');

// Configure Multer for in-memory uploads (used for forwarding directly to ImgBB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

/**
 * Helper to upload Base64 image data to ImgBB completely free.
 * @param {string} base64Data - Raw base64 string or data URI schema
 * @returns {Promise<string>} - The permanent image URL
 */
async function uploadToImgbb(base64Data) {
  if (!process.env.IMGBB_API_KEY) throw new Error('IMGBB_API_KEY is not configured in .env');
  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  
  const formData = new FormData();
  formData.append('key', process.env.IMGBB_API_KEY);
  formData.append('image', base64Content);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'ImgBB upload failed');
  return data.data.url;
}

module.exports = { upload, uploadToImgbb };
