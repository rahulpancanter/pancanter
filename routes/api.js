// Get PAN data by email
router.get('/my-pan-applications', async (req, res) => {
  const { email } = req.query;
  try {
    const data = await Pandata.find({ email });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});