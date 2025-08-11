const admin = require('firebase-admin');

const db = admin.firestore();

exports.getNotes = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    
    const notesRef = db.collection('data').doc(userAccessKey).collection('notes');
    const snapshot = await notesRef.orderBy('date', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No notes found',
        data: []
      });
    }
    
    const notes = [];
    snapshot.forEach(doc => {
      notes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      message: 'Notes retrieved successfully',
      data: notes
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Failed to get notes', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const noteData = req.body;
    
    const notesRef = db.collection('data').doc(userAccessKey).collection('notes');
    const docRef = await notesRef.add({
      ...noteData,
      date: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Note created successfully',
      id: docRef.id,
      data: noteData
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    const updateData = req.body;
    
    const noteRef = db.collection('data').doc(userAccessKey).collection('notes').doc(id);
    await noteRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({
      message: 'Note updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const userAccessKey = req.user.accessKey;
    const { id } = req.params;
    
    const noteRef = db.collection('data').doc(userAccessKey).collection('notes').doc(id);
    await noteRef.delete();
    
    res.status(200).json({
      message: 'Note deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
};