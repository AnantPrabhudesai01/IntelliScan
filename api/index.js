import app from '../intelliscan-server/src/app.js';

export default async function handler(req, res) {
  // Log the method for debugging in Vercel Logs
  console.log(`Incoming request: ${req.method} ${req.url}`);
  
  // Forward everything to Express
  return app(req, res);
}