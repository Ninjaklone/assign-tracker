const Assignment = require('../models/Assignment');

class AssignmentController {
  // Render Home Page with Dashboard Statistics
  async getHomePage(req, res) {
    try {
      // Get statistics for the dashboard
      const [
        totalAssignments, 
        overdueAssignments, 
        completedAssignments,
        inProgressAssignments
      ] = await Promise.all([
        Assignment.countDocuments(),
        Assignment.countDocuments({
          dueDate: { $lt: new Date() },
          status: { $ne: 'Completed' }
        }),
        Assignment.countDocuments({ status: 'Completed' }),
        Assignment.countDocuments({ status: 'In Progress' })
      ]);

      // Render the home page with comprehensive stats
      res.render('home', { 
        title: 'Assignment Tracker Dashboard',
        stats: {
          total: totalAssignments,
          overdue: overdueAssignments,
          completed: completedAssignments,
          inProgress: inProgressAssignments
        }
      });
    } catch (error) {
      console.error('Dashboard Error:', error);
      res.status(500).render('error', { 
        title: 'Dashboard Error',
        message: 'Unable to load dashboard statistics',
        error: error.message
      });
    }
  }

  // List All Assignments with Advanced Filtering
  async getAllAssignments(req, res) {
    try {
      // Extract query parameters for filtering
      const { status, priority, course } = req.query;

      // Build dynamic filter object
      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (course) filter.course = new RegExp(course, 'i'); // Case-insensitive course search

      // Find assignments with dynamic filtering and sorting
      const assignments = await Assignment.find(filter)
        .sort({ 
          priority: -1,  // High priority first
          dueDate: 1     // Earliest due date first
        });

      res.render('assignments', { 
        title: 'All Assignments',
        assignments,
        filter: req.query // Pass back filter for maintaining form state
      });
    } catch (error) {
      console.error('Assignments Fetch Error:', error);
      res.status(500).render('error', { 
        title: 'Assignments Error',
        message: 'Unable to fetch assignments',
        error: error.message
      });
    }
  }

  // Render Add Assignment Form
  addAssignmentForm(req, res) {
    res.render('add-assignment', { 
      title: 'Add New Assignment',
      assignment: {} // Empty object for consistent form handling
    });
  }

  // Create New Assignment
  async createAssignment(req, res) {
    try {
      // Validate input data
      const { title, course, dueDate, priority, description } = req.body;

      // Create new assignment
      const newAssignment = new Assignment({
        title: title.trim(),
        course: course.trim(),
        dueDate: new Date(dueDate),
        priority: priority || 'Medium',
        description: description ? description.trim() : '',
        status: 'Not Started'
      });

      // Save assignment
      await newAssignment.save();

      // Flash success message
      req.flash('success', 'Assignment added successfully');
      
      // Redirect to assignments list
      res.redirect('/assignments');
    } catch (error) {
      console.error('Assignment Creation Error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).render('add-assignment', {
          title: 'Add Assignment',
          error: errorMessages,
          assignment: req.body
        });
      }

      // Generic error handling
      res.status(500).render('error', {
        title: 'Assignment Creation Error',
        message: 'Failed to create assignment',
        error: error.message
      });
    }
  }

  // Render Edit Assignment Form
  async editAssignmentForm(req, res) {
    try {
      const assignment = await Assignment.findById(req.params.id);
      
      if (!assignment) {
        req.flash('error', 'Assignment not found');
        return res.redirect('/assignments');
      }

      res.render('edit-assignment', { 
        title: 'Edit Assignment',
        assignment 
      });
    } catch (error) {
      console.error('Edit Assignment Fetch Error:', error);
      req.flash('error', 'Unable to load assignment for editing');
      res.redirect('/assignments');
    }
  }

  // Update Assignment
  async updateAssignment(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate)
      };

      const updatedAssignment = await Assignment.findByIdAndUpdate(
        id, 
        updateData, 
        { 
          new: true, 
          runValidators: true 
        }
      );

      if (!updatedAssignment) {
        req.flash('error', 'Assignment not found');
        return res.redirect('/assignments');
      }

      req.flash('success', 'Assignment updated successfully');
      res.redirect('/assignments');
    } catch (error) {
      console.error('Assignment Update Error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).render('edit-assignment', {
          title: 'Edit Assignment',
          error: errorMessages,
          assignment: req.body
        });
      }

      req.flash('error', 'Failed to update assignment');
      res.redirect('/assignments');
    }
  }

  // Delete Assignment
  async deleteAssignment(req, res) {
    try {
      const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);

      if (!deletedAssignment) {
        req.flash('error', 'Assignment not found');
        return res.redirect('/assignments');
      }

      req.flash('success', 'Assignment deleted successfully');
      res.redirect('/assignments');
    } catch (error) {
      console.error('Assignment Deletion Error:', error);
      req.flash('error', 'Failed to delete assignment');
      res.redirect('/assignments');
    }
  }
}

module.exports = new AssignmentController();