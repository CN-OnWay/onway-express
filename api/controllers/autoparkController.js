const admin = require('firebase-admin');

const db = admin.firestore();

exports.getAutopark = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const autoparkRef = db.collection('data').doc(userAccessKey).collection('autopark');
    const snapshot = await autoparkRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No autopark vehicles found',
        data: []
      });
    }
    
    const vehicles = [];
    snapshot.forEach(doc => {
      vehicles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Autopark retrieved successfully',
      data: vehicles
    });
  } catch (error) {
    console.error('Error getting autopark:', error);
    res.status(500).json({ message: 'Failed to get autopark', error: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const vehicleData = req.body;
    
    const autoparkRef = db.collection('data').doc(userAccessKey).collection('autopark');
    const docRef = await autoparkRef.add({
      ...vehicleData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Vehicle created successfully',
      id: docRef.id,
      data: vehicleData
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Failed to create vehicle', error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    const updateData = req.body;
    
    const vehicleRef = db.collection('data').doc(userAccessKey).collection('autopark').doc(id);
    await vehicleRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Vehicle updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Failed to update vehicle', error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    
    const vehicleRef = db.collection('data').doc(userAccessKey).collection('autopark').doc(id);
    await vehicleRef.delete();
    
    res.status(200).json({
      message: 'Vehicle deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Failed to delete vehicle', error: error.message });
  }
};