const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const NewPanCard = require('./models/NewPanCard');
const UpdatePan = require('./models/update-pan-card-appy');
const panRoutes = require('./routes/pan');
const UpdatePancarddoc = require('./models/PanUpload');
const Transaction = require('./models/Transaction');  // ✅ This was missing
const Newacceptenpan = require('./models/Newacceptenpan');

const app = express();

// ✅ Setup multer FIRST (before any route uses `upload`)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session setup
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
}));

// MongoDB connection
mongoose.connect('mongodb+srv://rahul199202012:gexBdbMGUqtwE3Nq@cluster0.k7xol6w.mongodb.net/pancenter', {
  // No need to use `useNewUrlParser` and `useUnifiedTopology`
})
.then(() => console.log('MongoDB connected successfully'))
.catch(error => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});

// Auth middleware
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) next();
  else res.status(401).send('Please login first');
}

// Static HTML routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin-signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-signup.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-login.html')));
app.get('/admin-pan-updatedetalsappy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-pan-updatedetalsappy.html')));
app.get('/retailer-login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-login.html')));
app.get('/retailer-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-dashboard.html')));
app.get('/retailer-profile', authMiddleware, (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-profile.html')));
app.get('/retailer-PAN-card-new-upload', (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-PAN-card-new-upload.html')));
app.get('/retailer-submission-success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-submission-success.html')));
app.get('/retailer-PAN-card-new-upload', (req, res) => res.sendFile(path.join(__dirname, 'public', 'retailer-PAN-card-new-upload.html')));

<<<<<<< HEAD
// ✅ Signup Route
=======
>>>>>>> b13bcc5 (Your commit message here)
app.post('/signup', upload.single('photo'), async (req, res) => {
  const { name, email, password, role, mobile, address } = req.body;

  if (!name || !email || !password || !role || !mobile || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!['admin', 'retailer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      mobile,
      address,
      photo: req.file ? req.file.path : '', // ✅ handle uploaded photo here
      walletbalance: 0
    });

    await user.save();
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      photo: user.photo,
      role: user.role,
      walletbalance: user.walletbalance
    };

    res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user
app.put('/users/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Convert walletbalance to number if it's passed
    if (updateData.walletbalance) {
      updateData.walletbalance = parseFloat(updateData.walletbalance);
    }

    // Handle photo upload
    if (req.file) {
      updateData.photo = req.file.path;
    }

    // Hash password if updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Actually update the DB
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Update session after DB update
    req.session.user = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      address: updatedUser.address,
      photo: updatedUser.photo,
      role: updatedUser.role,
      walletbalance: updatedUser.walletbalance
    };

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});


// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.redirect('/admin-login');
  });
});

// Get current logged-in user
app.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Submit new PAN card application (basic)
app.post('/submit-newpancardappy', async (req, res) => {
  try {
    const formData = req.body;
    const application_id = Date.now().toString().slice(-14);

    const newEntry = new NewPanCard({ ...formData, application_id });
    await newEntry.save();

    res.status(200).send('PAN card application submitted successfully!');
  } catch (error) {
    console.error('Save failed:', error);
    res.status(500).send('Error saving application');
  }
});

// Get all new PAN card applications
app.get('/api/pancards', async (req, res) => {
  try {
    const allData = await NewPanCard.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch PAN applications' });
  }
});

app.post('/submit-updatepancard', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'pancard_pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { body, files } = req;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).send('Please log in to continue');
    }

    const user = await User.findById(userId);
    if (!user || user.walletbalance < 115) {
      return res.status(400).send('Insufficient wallet balance');
    }

    const data = {
      application_id: body.application_id,
      photo: files.photo?.[0]?.path || '',
      signature: files.signature?.[0]?.path || '',
      pancard_pdf: files.pancard_pdf?.[0]?.path || '',
      processing_fee: 115
    };

    const newEntry = new UpdatePancarddoc(data);
    await newEntry.save();

    user.walletbalance -= 115;
    await user.save();

    req.session.user.walletbalance = user.walletbalance;

    res.status(200).send("✅ PAN documents submitted. ₹115 deducted from your wallet.");
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('❌ Submission failed');
  }
});

// Get all updated PAN card applications
app.get('/api/update_pan_card', async (req, res) => {
  try {
    const allData = await UpdatePancarddoc.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch PAN applications' });
  }
});

// ✅ PAN correction form submission
app.post('/submit-corrupdatepancard', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadhar_file', maxCount: 1 },
  { name: 'pancard_pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { body, files } = req;
    const userId = req.session.user?.id;
    const processing_fee = 115; // ✅ Declare it here

    if (!userId) {
      return res.status(401).send('❌ Please log in to continue');
    }

    const user = await User.findById(userId);
    if (!user || user.walletbalance < processing_fee) {
      return res.status(400).send('❌ Insufficient wallet balance');
    }

    // ✅ Deduct balance
    user.walletbalance -= processing_fee;
    await user.save();
    req.session.user.walletbalance = user.walletbalance; // ✅ Update session

    const newPan = new UpdatePan({
      ...body,
      processing_fee,
      aadhar_file: files['aadhar_file']?.[0]?.path || '',
      pancard_pdf: files['pancard_pdf']?.[0]?.path || '',
      photo: files['photo']?.[0]?.path || '',
      signature: files['signature']?.[0]?.path || ''
    });
    await newPan.save();

    const txn = new Transaction({
      email: user.email,
      amount: processing_fee,
      type: 'PAN Card Correction Application',
      reference: `TXN_PAN_${Date.now()}`,
      date: new Date()
    });
    await txn.save();

    res.status(200).send(`✅ PAN correction submitted. ₹${processing_fee} deducted. Remaining balance: ₹${user.walletbalance}`);
  } catch (err) {
    console.error('❌ Error submitting PAN correction:', err);
    res.status(500).send('❌ Internal Server Error');
  }
});


// Get all updated PAN card applications
app.get('/api/corrupdatepancard', async (req, res) => {
  try {
    const allData = await UpdatePan.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch PAN applications' });
  }
});

// Submit PAN
app.post('/api/submit-pan', async (req, res) => {
  try {
    const record = new Newacceptenpan(req.body);
    await record.save();
    res.json({ message: 'Submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting data.' });
  }
});

// Get All
app.get('/api/all-pan', async (req, res) => {
  const data = await Newacceptenpan.find().sort({ _id: -1 });
  res.json(data);
});

// Get one by ID
app.get('/api/pan/:id', async (req, res) => {
  try {
    const record = await Newacceptenpan.findById(req.params.id);
    res.json(record);
  } catch {
    res.status(404).json({ message: 'Not found' });
  }
});

// Update by ID
app.put('/api/update-pan/:id', async (req, res) => {
  try {
    await Newacceptenpan.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Updated successfully!' });
  } catch {
    res.status(500).json({ message: 'Update failed.' });
  }
});

// Delete by ID
app.delete('/api/delete-pan/:id', async (req, res) => {
  try {
    await Newacceptenpan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully!' });
  } catch {
    res.status(500).json({ message: 'Delete failed.' });
  }
});



// Use additional PAN routes
app.use('/', panRoutes);

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});