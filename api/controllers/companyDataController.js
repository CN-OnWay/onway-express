const admin = require('firebase-admin');

const db = admin.firestore();

exports.getCompanyData = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const companyRef = db.collection('data').doc(userAccessKey);
    const doc = await companyRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        message: 'Company data not found'
      });
    }
    
    const companyData = doc.data();
    
    // Убираем системные поля
    delete companyData.app_users;
    delete companyData.autopark;
    delete companyData.notes;
    delete companyData.requests;
    delete companyData.routes;
    delete companyData.staff;
    
    res.status(200).json({
      message: 'Company data retrieved successfully',
      data: companyData
    });
  } catch (error) {
    console.error('Error getting company data:', error);
    res.status(500).json({ message: 'Failed to get company data', error: error.message });
  }
};

exports.updateCompanyData = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const updateData = req.body;
    
    const companyRef = db.collection('data').doc(userAccessKey);
    await companyRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Company data updated successfully'
    });
  } catch (error) {
    console.error('Error updating company data:', error);
    res.status(500).json({ message: 'Failed to update company data', error: error.message });
  }
};