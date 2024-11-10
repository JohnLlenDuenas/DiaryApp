const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const multer = require('multer');  // Add multer here
const path = require('path');

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');  // Define upload path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Save with a unique name
    }
});
const upload = multer({ storage: storage });  // Initialize multer

// Route to render the form for writing a new diary entry
router.get('/write', (req, res) => {
    res.render('write');
});

// Route to handle diary entry submission
router.post('/write', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
    try {
        const newDiary = new Diary({
            title: req.body.title,
            content: req.body.content,
            image1: req.files['image1'][0].filename,
            image2: req.files['image2'][0].filename
        });
        await newDiary.save();
        res.redirect('/diary/gallery');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving diary entry');
    }
});

// Route to display all diary entries in a gallery
router.get('/gallery', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10; // Show 10 diaries per page
    const skip = (page - 1) * limit;

    // Fetch diaries sorted by date (descending), limit, and skip for pagination
    const diaries = await Diary.find()
        .sort({ date: -1 })  // Sort by date in descending order
        .skip(skip)
        .limit(limit);

    const totalDiaries = await Diary.countDocuments(); // Get total diary count

    res.render('gallery', { 
        diaries: diaries, 
        currentPage: page, 
        totalPages: Math.ceil(totalDiaries / limit) // Calculate total pages
    });
});

// Route to view a single diary entry
router.get('/view/:id', async (req, res) => {
    const diary = await Diary.findById(req.params.id);
    res.render('view', { diary: diary });
});

module.exports = router;
