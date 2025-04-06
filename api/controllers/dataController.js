require('dotenv').config();
const axios = require('axios');

const APP_URL = process.env.APP_URL
const SITE_URL = process.env.SITE_URL

exports.handleSubmits = async (req, res) => {
  try {
    const data = req.body;
    const response = await axios.post(`${APP_URL}/submits`, data);

    res.status(200).json({
      message: 'Data successfully sent to the app',
      appResponse: response.data,
    });
  } catch (error) {
    console.error('Error in handleSubmits:', error.message);
    res.status(500).json({ message: 'Failed to send data to the app', error: error.message });
  }
};

exports.handleRates = async (req, res) => {
  try {
    const data = req.body;
    const response = await axios.post(`${SITE_URL}/rates`, data);

    res.status(200).json({
      message: 'Data successfully sent to the site',
      siteResponse: response.data,
    });
  } catch (error) {
    console.error('Error in handleRates:', error.message);
    res.status(500).json({ message: 'Failed to send data to the site', error: error.message });
  }
};