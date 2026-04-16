// api/index.js (At the VERY root of your project)
import app from '../intelliscan-server/src/app.js';

export default async (req, res) => {
  return app(req, res); // This allows Express to handle the POST method
};