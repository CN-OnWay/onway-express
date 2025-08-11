const axios = require('axios');

const SITE_URL = process.env.SITE_URL;

exports.handleSubmits = async (req, res) => {
  try {
    const data = req.body;
    const response = await axios.post(`${SITE_URL}/submits`, data);

    res.status(200).json({
      message: 'Data successfully sent to the site',
      siteResponse: response.data,
    });
  } catch (error) {
    console.error('Error in handleSubmits:', error.message);
    res.status(500).json({ message: 'Failed to send data to the site', error: error.message });
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

exports.getData = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Protected data accessed successfully',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        rate: req.user.rate
      }
    });
  } catch (error) {
    console.error('Error in getData:', error.message);
    res.status(500).json({ message: 'Failed to get data', error: error.message });
  }
};