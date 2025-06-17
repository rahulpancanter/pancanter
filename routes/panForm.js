const express = require('express');
const router = express.Router();
const NewPanCard = require('../models/NewPanCard'); // Adjust path if needed

router.post('/submit-newpancardappy', async (req, res) => {
  try {
    const formData = req.body;

    // Optional: Generate a 14-digit unique application ID
    const application_id = Date.now().toString().slice(-14);

    const newEntry = new NewPanCard({
      ...formData,
      application_id,
    });

    await newEntry.save();
    res.status(200).send('PAN card application submitted successfully!');
  } catch (error) {
    console.error('Save failed:', error);
    res.status(500).send('Error saving application');
  }
});

// API to fetch all PAN card applications
router.get('/api/pancards', async (req, res) => {
  try {
    const allData = await NewPanCard.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch PAN applications' });
  }
});

module.exports = router;
