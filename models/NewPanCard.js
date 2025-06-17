const mongoose = require('mongoose');

const newPanCardSchema = new mongoose.Schema({
  application_id: String,
  category: String,
  panType: String,
  title: String,
  fullpanname: String,
  mobile: String,
  email: String,
  income_source: String,
  dob: String,
  gender: String,
  residenceaddress: String,
  pincode: String,
  postoffice: String,
  flatroomdoorblockno: String,
  nameofpremisesbuildingvillage: String,
  arealocalitytaluksubdivision: String,
  towncitydistrict: String,
  state: String,
  parentoption: String,
  father_name: String,
  mother_name: String,
  parentoptionyes: String,
  aadhar_number: String,
  voter_id: String,
  identity_proof: String,
  address_proof: String,
  dob_proof: String,
  area_code: String,
  ao_type: String,
  range_code: String,
  ao_number: String,
  processing_fee: Number
}, { timestamps: true });

module.exports = mongoose.model('NewPanCard', newPanCardSchema);
