const admin = require('firebase-admin');

const db = admin.firestore();

exports.getRequests = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const requestsRef = db.collection('data').doc(userAccessKey).collection('requests');
    const snapshot = await requestsRef.orderBy('date', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No requests found',
        data: []
      });
    }
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Requests retrieved successfully',
      data: requests
    });
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ message: 'Failed to get requests', error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const requestData = req.body;
    
    const requestsRef = db.collection('data').doc(userAccessKey).collection('requests');
    const docRef = await requestsRef.add({
      ...requestData,
      date: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Request created successfully',
      id: docRef.id,
      data: requestData
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    const updateData = req.body;
    
    const requestRef = db.collection('data').doc(userAccessKey).collection('requests').doc(id);
    await requestRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Request updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Failed to update request', error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    
    const requestRef = db.collection('data').doc(userAccessKey).collection('requests').doc(id);
    await requestRef.delete();
    
    res.status(200).json({
      message: 'Request deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
};