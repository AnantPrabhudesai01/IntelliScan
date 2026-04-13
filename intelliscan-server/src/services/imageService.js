/**
 * Helper to upload Base64 image data to ImgBB.
 * @param {string} base64Data - Raw base64 string or data URI schema
 * @returns {Promise<string>} - The permanent image URL
 */
async function uploadToImgbb(base64Data) {
  if (!process.env.IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY is not configured in .env');
  }

  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const formData = new URLSearchParams();
  formData.append('key', process.env.IMGBB_API_KEY);
  formData.append('image', base64Content);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'ImgBB upload failed');
  }

  return data.data.url;
}

module.exports = {
  uploadToImgbb
};
