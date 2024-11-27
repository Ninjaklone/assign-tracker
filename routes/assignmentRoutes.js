const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./authRoutes');
const assignmentController = require('../controllers/assignmentController');

// Async Handling
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Home Route
router.get('/', asyncHandler(assignmentController.getHomePage));

// Assignment Routes
router.get('/assignments', asyncHandler(assignmentController.getAllAssignments));
router.post('/assignments', asyncHandler(assignmentController.createAssignment)); 

// Add Assignment Routes
router.get('/add-assignment', authMiddleware, assignmentController.addAssignmentForm);
router.post('/add-assignment', authMiddleware, asyncHandler(assignmentController.createAssignment));

// Edit Assignment Routes
router.get('/edit-assignment/:id', authMiddleware, asyncHandler(assignmentController.editAssignmentForm));
router.post('/edit-assignment/:id', authMiddleware, asyncHandler(assignmentController.updateAssignment));

// Delete Assignment Route
router.get('/delete-assignment/:id', authMiddleware, asyncHandler(assignmentController.deleteAssignment));

module.exports = router;