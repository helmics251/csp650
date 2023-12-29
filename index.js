const app = require("./app");
const flash = require("express-flash");
const port = 3000;

//listen to port
app.listen(port, () => {
  console.log(`\nServer is running on http://localhost:${port}`);
});

app.use(flash());
const homeRoute = require("./routes/home");

//guest routes
const signupRoute = require("./routes/guest/signup");
const loginRoute = require("./routes/guest/login");
const guestSearchRoute = require("./routes/guest/guestSearch");

//staff routes
const addparcelRoute = require("./routes/staff/addparcel");
const parcelListRoute = require("./routes/staff/parcelList");
const editParcelRoute = require("./routes/staff/editParcel");
const markAsCollectedRoute = require("./routes/staff/markAsCollected");
const searchParcelRoute = require("./routes/staff/searchParcel");
const removeParcelRoute = require("./routes/staff/removeParcel");
const staffsettingRoute = require("./routes/staff/staffsetting");
const staffUploadPictureRoute = require("./routes/staff/staffUploadPicture");
const staffGeneralSettingRoute = require("./routes/staff/staffGeneralSetting");
const staffPasswordSettingRoute = require("./routes/staff/staffPasswordSetting");
const staffAddLockerRoute = require("./routes/staff/staffAddLocker");
const reportRoute = require("./routes/staff/report");
const staffRemoveLockerRoute = require("./routes/staff/staffRemoveLocker");
const staffSetupPricingRoute = require("./routes/staff/staffSetupPricing");
const staffRemoveMinWeightRoute = require("./routes/staff/staffRemoveMinWeight");

//admin routes
const manageStaffRoute = require("./routes/admin/manageStaff");
const manageUserRoute = require("./routes/admin/manageUser");
const addstaffRoute = require("./routes/admin/addstaff");
const resetStaffPasswordRoute = require("./routes/admin/resetStaffPassword");
const editStaffRoute = require("./routes/admin/editStaff");
const deleteRecordsRoute = require("./routes/admin/deleteRecords");
const editUserRoute = require("./routes/admin/editUser");
const resetUserPasswordRoute = require("./routes/admin/resetUserPassword");
const deleteUserRecordsRoute = require("./routes/admin/deleteUserRecords");

//logout
const logoutRoute = require("./routes/logout");

app.use("/", homeRoute);

//guest routes
app.use("/signup", signupRoute);
app.use("/login", loginRoute);
app.use("/guestSearch", guestSearchRoute);

//Staff routes
app.use("/addparcel", addparcelRoute);
app.use("/parcelList", parcelListRoute);
app.use("/editParcel", editParcelRoute);
app.use("/markAsCollected", markAsCollectedRoute);
app.use("/searchParcel", searchParcelRoute);
app.use("/removeParcel", removeParcelRoute);
app.use("/staffsetting", staffsettingRoute);
app.use("/staffUploadPicture", staffUploadPictureRoute);
app.use("/staffGeneralSetting", staffGeneralSettingRoute);
app.use("/staffPasswordSetting", staffPasswordSettingRoute);
app.use("/staffAddLocker", staffAddLockerRoute);
app.use("/report", reportRoute);
app.use("/staffRemoveLocker", staffRemoveLockerRoute);
app.use("/staffSetupPricing", staffSetupPricingRoute);
app.use("/staffRemoveMinWeight", staffRemoveMinWeightRoute);

//admin routes
app.use("/manageStaff", manageStaffRoute);
app.use("/manageUser", manageUserRoute);
app.use("/addstaff", addstaffRoute);
app.use("/resetStaffPassword", resetStaffPasswordRoute);
app.use("/editStaff", editStaffRoute);
app.use("/deleteRecords", deleteRecordsRoute);
app.use("/editUser", editUserRoute);
app.use("/resetUserPassword", resetUserPasswordRoute);
app.use("/deleteUserRecords", deleteUserRecordsRoute);

//logout
app.use("/logout", logoutRoute);


// error 404
app.get("*", function (req, res) {
  res.status(404).render("guest/error404");
});
