const mongoose = require("mongoose");

// Define a Mongoose schema for the collection
const collectedParcelSchema = new mongoose.Schema({
  name: String,
  phone: String,
  studentNumber: String,
  parceltype: String,
  parcelID: String,
  tracking: String,
  dateAdded: String,
  dateCollected: String,
  isCollected: Boolean,
  parcelWeight: Number,
  price: Number,
});
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  email: String,
  studentNumber: String,
  phoneNumber: String,
  Parcel: [collectedParcelSchema],
});
const lockerSchema = new mongoose.Schema({
  lockerName: String,
  isEmpty: Boolean,
  // Add parcel property to store the parcel information
  parcel: {
    type: Object,
    default: null,
  },
});
const pricingSchema = new mongoose.Schema({
  minWeight: Number,
  price: Number,
});
const staffSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  profilePictureName: String,
  username: String,
  staffId: String,
  email: String,
  isAdmin: Boolean,
  password: String,
  locker: [lockerSchema],
  collectedParcel: [collectedParcelSchema],
  removedParcel: [collectedParcelSchema],
  pricing: [pricingSchema],
});

// Create a Mongoose model
//const numColumns = staffSchema.path('locker').schema.paths['lockerName'].enumValues.length;
const User = mongoose.model("users", userSchema);
const Staff = mongoose.model("staffs", staffSchema);

module.exports = {
  User,
  Staff,
};
