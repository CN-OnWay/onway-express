const admin = require('firebase-admin');

const db = admin.firestore();

exports.getAppUsers = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const appUsersRef = db.collection('data').doc(userAccessKey).collection('app-users');
    const snapshot = await appUsersRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No app users found',
        data: []
      });
    }
    
    const appUsers = [];
    snapshot.forEach(doc => {
      appUsers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'App users retrieved successfully',
      data: appUsers
    });
  } catch (error) {
    console.error('Error getting app users:', error);
    res.status(500).json({ message: 'Failed to get app users', error: error.message });
  }
};

exports.createAppUser = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const userData = req.body;
    
    const appUsersRef = db.collection('data').doc(userAccessKey).collection('app-users');
    const docRef = await appUsersRef.add({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'App user created successfully',
      id: docRef.id,
      data: userData
    });
  } catch (error) {
    console.error('Error creating app user:', error);
    res.status(500).json({ message: 'Failed to create app user', error: error.message });
  }
};

exports.updateAppUser = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    const updateData = req.body;
    
    const appUserRef = db.collection('data').doc(userAccessKey).collection('app-users').doc(id);
    await appUserRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'App user updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating app user:', error);
    res.status(500).json({ message: 'Failed to update app user', error: error.message });
  }
};

exports.deleteAppUser = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    
    const appUserRef = db.collection('data').doc(userAccessKey).collection('app-users').doc(id);
    await appUserRef.delete();
    
    res.status(200).json({
      message: 'App user deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting app user:', error);
    res.status(500).json({ message: 'Failed to delete app user', error: error.message });
  }
};