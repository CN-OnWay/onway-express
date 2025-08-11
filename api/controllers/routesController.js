const admin = require('firebase-admin');

const db = admin.firestore();

exports.getRoutes = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const routesRef = db.collection('data').doc(userAccessKey).collection('routes');
    const snapshot = await routesRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No routes found',
        data: []
      });
    }
    
    const routes = [];
    snapshot.forEach(doc => {
      routes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Routes retrieved successfully',
      data: routes
    });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ message: 'Failed to get routes', error: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { routeId } = req.params;
    
    const transfersRef = db.collection('data').doc(userAccessKey).collection('routes').doc(routeId).collection('transfers');
    const snapshot = await transfersRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No transfers found',
        data: []
      });
    }
    
    const transfers = [];
    snapshot.forEach(doc => {
      transfers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Transfers retrieved successfully',
      data: transfers
    });
  } catch (error) {
    console.error('Error getting transfers:', error);
    res.status(500).json({ message: 'Failed to get transfers', error: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const routeData = req.body;
    
    const routesRef = db.collection('data').doc(userAccessKey).collection('routes');
    const docRef = await routesRef.add({
      ...routeData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Route created successfully',
      id: docRef.id,
      data: routeData
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: 'Failed to create route', error: error.message });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { routeId } = req.params;
    const transferData = req.body;
    
    const transfersRef = db.collection('data').doc(userAccessKey).collection('routes').doc(routeId).collection('transfers');
    const docRef = await transfersRef.add({
      ...transferData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Transfer created successfully',
      id: docRef.id,
      data: transferData
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ message: 'Failed to create transfer', error: error.message });
  }
};