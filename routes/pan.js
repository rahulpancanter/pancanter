const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PanData = require('../models/PanData');
const PanUpload = require('../models/PanUpload');
const PsaUser = require('../models/PsaUser');
const bankpassbookUser = require('../models/bankpassbookUser')

// 🔧 Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only JPEG and PDF files are allowed.`));
  }
};

const upload = multer({ storage, fileFilter });


// Submit
router.post('/api/pan/submit', upload.single('pdf'), async (req, res) => {
  try {
    const { acknowledgmentNo, pannumber, fullName, email, status } = req.body;
    const pdfFileName = req.file ? req.file.filename : null;

    const newEntry = new PanData({ acknowledgmentNo, pannumber, fullName, email, status, pdfFileName });
    await newEntry.save();
    res.status(201).json({ message: 'Saved', data: newEntry });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/api/pan/:id', upload.single('pdf'), async (req, res) => {
  try {
    const { acknowledgmentNo, pannumber, fullName, email, status } = req.body;
    const update = { acknowledgmentNo, pannumber, fullName, email, status };
    if (req.file) update.pdfFileName = req.file.filename;

    const updated = await PanData.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// All data
router.get('/api/pan/all', async (req, res) => {
  try {
    const data = await PanData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/api/pan/:id', async (req, res) => {
  try {
    const entry = await PanData.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });

    const filePath = path.join(__dirname, 'uploads', entry.pdfFileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await entry.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// 🟢 Form Upload: Multiple files (photo, signature, pdf)
router.post('/submit-newpan-update', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { application_id } = req.body;
    const photo = req.files['photo']?.[0]?.path || '';
    const signature = req.files['signature']?.[0]?.path || '';
    const pdf = req.files['pdf']?.[0]?.path || '';

    const newUpload = new PanUpload({
      application_id,
      photo,
      signature,
      pdf,
      submittedAt: new Date()
    });

    await newUpload.save();
    res.status(200).send('Saved Successfully');
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// GET: Fetch PAN uploads
router.get('/api/pan/uploads', async (req, res) => {
  try {
    const uploads = await PanUpload.find().sort({ submittedAt: -1 });
    res.json(uploads);
  } catch (err) {
    console.error('GET Uploads error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Create PSA
router.post('/create-psa', async (req, res) => {
  try {
    const psaData = req.body;
    const newPsa = new PsaUser(psaData);
    await newPsa.save();
    res.json({ success: true, message: 'nsdl pammid contact confirm the activate 24 ghante ke andar' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT: Update
router.put('/update-psa/:id', async (req, res) => {
  try {
    await PsaUser.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'nsdl pammid updated successfully' });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// DELETE: Delete
router.delete('/delete-psa/:id', async (req, res) => {
  try {
    await PsaUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'nsdl pammid deleted successfully' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// GET: All PSA Entries
router.get('/all/get-psa', async (req, res) => {
  try {
    const data = await PsaUser.find().sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch data' });
  }
});

router.post('/create-bankpassbook', upload.single('pdfFile'), async (req, res) => {
  try {
    const psaData = req.body;
    if (req.file) {
      psaData.pdfPath = req.file.path; // Store file path in DB
    }

    const newbankpassbook = new bankpassbookUser(psaData);
    await newbankpassbook.save();

    res.json({ success: true, message: 'Bank passbook contact confirm the activate 24 ghante ke andar' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update
router.put('/update-bankpassbook/:id', upload.single('pdfFile'), async (req, res) => {
  try {
    const { fullname, username, mobile } = req.body;
    const update = { fullname, username, mobile };

    if (req.file) {
      update.pdfPath = req.file.path;
    }

    await bankpassbookUser.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});


// Delete
router.delete('/delete-bankpassbook/:id', async (req, res) => {
  try {
    const deleted = await bankpassbookUser.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});


// ✅ Correct GET route for displaying bank passbook data
router.get('/all/get-bankpassbook', async (req, res) => {
  try {
    const data = await bankpassbookUser.find().sort({ _id: -1 }); // ✅ yeh sahi model hai
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch data' });
  }
});


module.exports = router;
