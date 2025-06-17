const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PanData = require('../models/PanData');
const PanUpload = require('../models/PanUpload');
const PsaUser = require('../models/PsaUser');
const Newacceptenpan = require('../models/Newacceptenpan');

// 🔧 Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// 🔐 File filter based on fieldname
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = {
    photo: ['image/jpeg', 'image/jpg'],
    signature: ['image/jpeg', 'image/jpg'],
    pdf: ['application/pdf']
  };

  const fieldName = file.fieldname;
  const mimeTypes = allowedMimeTypes[fieldName] || [];

  if (mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${mimeTypes.join(', ')} files are allowed for ${fieldName}`));
  }
};

const upload = multer({ storage, fileFilter }); // ✅ Defined before any routes

// 🟢 POST: Submit only PDF (API route)
router.post('/api/pan/submit', upload.single('pdf'), async (req, res) => {
  try {
    const { acknowledgmentNo, pannumber, fullName, email, status } = req.body;
    const pdfFileName = req.file ? req.file.filename : null;
    const newEntry = new PanData({ acknowledgmentNo, pannumber, fullName, email, status, pdfFileName });
    await newEntry.save();
    res.status(201).json({ message: 'Saved successfully' });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟡 PUT: Update PDF
router.put('/api/pan/:id', upload.single('pdf'), async (req, res) => {
  try {
    const { acknowledgmentNo, pannumber, fullName, email, status } = req.body;
    const update = { acknowledgmentNo, pannumber, fullName, email, status };
    if (req.file) update.pdfFileName = req.file.filename;

    const updated = await PanData.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔵 GET: All Data
router.get('/api/pan/all', async (req, res) => {
  try {
    const data = await PanData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔴 DELETE
router.delete('/api/pan/:id', async (req, res) => {
  try {
    const entry = await PanData.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Not found' });

    if (entry.pdfFileName) {
      const filePath = path.join(__dirname, '../uploads', entry.pdfFileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await entry.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
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

// // POST - Submit New PAN
// router.post('/submit-pan', async (req, res) => {
//   try {
//     const { parentName, dob, mobile, status, time, ackNo, remark } = req.body;

//     const newPan = new Newacceptenpan({ parentName, dob, mobile, status, time, ackNo, remark });
//     await newPan.save();

//     res.status(200).json({ message: 'Submitted successfully!', data: newPan });
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong!', error: error.message });
//   }
// });

// // GET - All PAN Records
// router.get('/all-pan', async (req, res) => {
//   try {
//     const pans = await Newacceptenpan.find().sort({ createdAt: -1 });
//     res.json(pans);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch records' });
//   }
// });

// // PUT - Update
// router.put('/update-pan/:id', async (req, res) => {
//   try {
//     const updatedPan = await Newacceptenpan.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedPan) return res.status(404).send('No record found');
//     res.json({ message: 'PAN Application Updated', data: updatedPan });
//   } catch (error) {
//     res.status(500).json({ message: 'Update failed', error: error.message });
//   }
// });

// // DELETE - Delete
// router.delete('/delete-pan/:id', async (req, res) => {
//   try {
//     const deletedPan = await Newacceptenpan.findByIdAndDelete(req.params.id);
//     if (!deletedPan) return res.status(404).send('No record found');
//     res.json({ message: 'PAN Application Deleted', data: deletedPan });
//   } catch (error) {
//     res.status(500).json({ message: 'Delete failed', error: error.message });
//   }
// });

module.exports = router;
