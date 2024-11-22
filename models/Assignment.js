const mongoose = require('mongoose');

// Comprehensive Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Assignment title is required'],
    trim: true
  },
  course: { 
    type: String, 
    required: [true, 'Course name is required']
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  title: { 
    type: String, 
    required: [true, 'Assignment title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  course: { 
    type: String, 
    required: [true, 'Course name is required'],
    trim: true
  },

});

// Add a virtual to check if assignment is overdue
AssignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Completed';
});

module.exports = mongoose.model('Assignment', AssignmentSchema);