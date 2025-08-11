const admin = require('firebase-admin');

const db = admin.firestore();

exports.getStaff = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const staffRef = db.collection('data').doc(userAccessKey).collection('staff');
    const snapshot = await staffRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No staff members found',
        data: []
      });
    }
    
    const staff = [];
    snapshot.forEach(doc => {
      staff.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Staff retrieved successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error getting staff:', error);
    res.status(500).json({ message: 'Failed to get staff', error: error.message });
  }
};

exports.createStaffMember = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const staffData = req.body;
    
    const staffRef = db.collection('data').doc(userAccessKey).collection('staff');
    const docRef = await staffRef.add({
      ...staffData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Staff member created successfully',
      id: docRef.id,
      data: staffData
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Failed to create staff member', error: error.message });
  }
};

exports.updateStaffMember = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    const updateData = req.body;
    
    const staffRef = db.collection('data').doc(userAccessKey).collection('staff').doc(id);
    await staffRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Staff member updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ message: 'Failed to update staff member', error: error.message });
  }
};

exports.deleteStaffMember = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    
    const staffRef = db.collection('data').doc(userAccessKey).collection('staff').doc(id);
    await staffRef.delete();
    
    res.status(200).json({
      message: 'Staff member deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Failed to delete staff member', error: error.message });
  }
};