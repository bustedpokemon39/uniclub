const mongoose = require('mongoose');

const enrolledUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
}, {
  collection: 'EnrolledUser' // Force this exact collection name
});

// Create the model with explicit collection name
const EnrolledUser = mongoose.model('EnrolledUser', enrolledUserSchema, 'EnrolledUser');

module.exports = EnrolledUser; 