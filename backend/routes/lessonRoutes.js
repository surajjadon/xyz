const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// Get Module (Sidebar data)
router.get('/:slug', lessonController.getLessonBySlug);

// Create Module (e.g., "C++ Basics")
router.post('/', lessonController.createLesson);

// 👇 NEW: Add a specific Problem to a Module
// POST /api/lessons/cpp-basics/add-problem
router.put('/:slug/add-problem', lessonController.addProblemsToLesson);

module.exports = router;